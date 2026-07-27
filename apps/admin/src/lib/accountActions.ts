import { collection, addDoc, onSnapshot, serverTimestamp, type DocumentReference } from 'firebase/firestore'
import { db, auth } from './firebase'

export type AccountActionType = 'suspend' | 'unsuspend' | 'delete'

/**
 * Submits an accountActions request document and waits for the Firestore-triggered
 * Cloud Function (onAccountAction, in functions/src/index.ts) to process it,
 * resolving or rejecting based on the document's resulting status field.
 *
 * This avoids calling an onCall Cloud Function directly, since onCall requires a
 * public invoker IAM grant that this project's org policy blocks. Writing a
 * request document instead (create-only, gated to admins by Firestore rules)
 * uses the same Firestore-trigger style as onNewTicket/onTicketUpdated, which is
 * already proven to deploy successfully in this project.
 */
export function submitAccountAction(type: AccountActionType, uid: string): Promise<void> {
  return new Promise((resolve, reject) => {
    addDoc(collection(db, 'accountActions'), {
      type,
      uid,
      requestedBy: auth.currentUser?.uid ?? null,
      requestedAt: serverTimestamp(),
      status: 'pending',
    })
      .then((actionRef: DocumentReference) => {
        const timeout = setTimeout(() => {
          unsubscribe()
          reject(new Error('Timed out waiting for the action to complete.'))
        }, 15000)

        const unsubscribe = onSnapshot(actionRef, (snap) => {
          const data = snap.data()
          if (!data || data.status === 'pending') return
          clearTimeout(timeout)
          unsubscribe()
          if (data.status === 'done') {
            resolve()
          } else {
            reject(new Error(data.error ?? 'Action failed.'))
          }
        })
      })
      .catch(reject)
  })
}
