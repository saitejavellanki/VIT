import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';

export const postActions = {
  handleLike: async (postId, userId) => {
    const postRef = doc(firestore, 'posts', postId);
    
    const postSnap = await getDoc(postRef);
    const likes = postSnap.data()?.likes || [];
    
    if (likes.includes(userId)) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    }
  }
};