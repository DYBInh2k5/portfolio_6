// Firestore Posts Service
// This file handles fetching posts from Firebase Firestore

import { db } from './firebase';
import { normalizePostInput } from './utils/contentValidation';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

async function isPostSlugTaken(slug, excludeId) {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.some((snapshotDoc) => snapshotDoc.id !== excludeId);
}


// Fetch all posts from Firestore
export async function getAllPosts() {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Fetch single post by slug
export async function getPostBySlug(slug) {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Fetch latest posts
export async function getLatestPosts(count = 10) {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('date', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

// Subscribe to posts changes in realtime
export function subscribeToPosts(callback, onError) {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const posts = querySnapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));
      callback(posts);
    },
    (error) => {
      console.error('Error subscribing posts:', error);
      if (onError) onError(error);
    }
  );
}

// Create new post
export async function createPost(postData) {
  try {
    const { normalized, errors } = normalizePostInput(postData);
    if (errors.length) {
      return { error: errors.join(' '), success: false };
    }

    if (await isPostSlugTaken(normalized.slug)) {
      return { error: 'Slug already exists.', success: false };
    }

    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...normalized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: error.message, success: false };
  }
}

// Update post
export async function updatePost(postId, postData) {
  try {
    const { normalized, errors } = normalizePostInput(postData);
    if (errors.length) {
      return { error: errors.join(' '), success: false };
    }

    if (await isPostSlugTaken(normalized.slug, postId)) {
      return { error: 'Slug already exists.', success: false };
    }

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...normalized,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { error: error.message, success: false };
  }
}

// Delete post
export async function deletePost(postId) {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error: error.message, success: false };
  }
}

// Delete multiple posts
export async function deletePostsBulk(postIds = []) {
  try {
    const ids = Array.from(new Set(postIds.filter(Boolean)));
    if (!ids.length) return { success: true, deleted: 0 };

    const batch = writeBatch(db);
    ids.forEach((postId) => {
      batch.delete(doc(db, 'posts', postId));
    });
    await batch.commit();
    return { success: true, deleted: ids.length };
  } catch (error) {
    console.error('Error bulk deleting posts:', error);
    return { error: error.message, success: false };
  }
}

// Update draft status for multiple posts
export async function updatePostsDraftStatusBulk(postIds = [], draft = false) {
  try {
    const ids = Array.from(new Set(postIds.filter(Boolean)));
    if (!ids.length) return { success: true, updated: 0 };

    const batch = writeBatch(db);
    ids.forEach((postId) => {
      batch.update(doc(db, 'posts', postId), {
        draft: Boolean(draft),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return { success: true, updated: ids.length };
  } catch (error) {
    console.error('Error bulk updating posts draft status:', error);
    return { error: error.message, success: false };
  }
}

// Update featured status for multiple posts
export async function updatePostsFeaturedStatusBulk(postIds = [], featured = false) {
  try {
    const ids = Array.from(new Set(postIds.filter(Boolean)));
    if (!ids.length) return { success: true, updated: 0 };

    const batch = writeBatch(db);
    ids.forEach((postId) => {
      batch.update(doc(db, 'posts', postId), {
        featured: Boolean(featured),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return { success: true, updated: ids.length };
  } catch (error) {
    console.error('Error bulk updating posts featured status:', error);
    return { error: error.message, success: false };
  }
}
