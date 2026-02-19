import { db } from "./firebase";
import { normalizeProjectInput } from "./utils/contentValidation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";

async function isProjectSlugTaken(slug, excludeId) {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.some((snapshotDoc) => snapshotDoc.id !== excludeId);
}

export async function getAllProjects() {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((projectDoc) => ({
      id: projectDoc.id,
      ...projectDoc.data(),
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug) {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    };
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    return null;
  }
}

export function subscribeToProjects(callback, onError) {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, orderBy("date", "desc"));
  return onSnapshot(
    q,
    (querySnapshot) => {
      const projects = querySnapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        ...projectDoc.data(),
      }));
      callback(projects);
    },
    (error) => {
      console.error("Error subscribing projects:", error);
      if (onError) onError(error);
    }
  );
}

export function subscribeToProjectBySlug(slug, callback, onError) {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("slug", "==", slug), limit(1));
  return onSnapshot(
    q,
    (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }
      callback({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      });
    },
    (error) => {
      console.error("Error subscribing project by slug:", error);
      if (onError) onError(error);
    }
  );
}

export async function createProject(projectData) {
  try {
    const { normalized, errors } = normalizeProjectInput(projectData);
    if (errors.length) {
      return { error: errors.join(" "), success: false };
    }

    if (await isProjectSlugTaken(normalized.slug)) {
      return { error: "Slug already exists.", success: false };
    }

    const projectsRef = collection(db, "projects");
    const docRef = await addDoc(projectsRef, {
      ...normalized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: error.message, success: false };
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const { normalized, errors } = normalizeProjectInput(projectData);
    if (errors.length) {
      return { error: errors.join(" "), success: false };
    }

    if (await isProjectSlugTaken(normalized.slug, projectId)) {
      return { error: "Slug already exists.", success: false };
    }

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...normalized,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: error.message, success: false };
  }
}

export async function deleteProject(projectId) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: error.message, success: false };
  }
}

export async function deleteProjectsBulk(projectIds = []) {
  try {
    const ids = Array.from(new Set(projectIds.filter(Boolean)));
    if (!ids.length) return { success: true, deleted: 0 };

    const batch = writeBatch(db);
    ids.forEach((projectId) => {
      batch.delete(doc(db, "projects", projectId));
    });
    await batch.commit();
    return { success: true, deleted: ids.length };
  } catch (error) {
    console.error("Error bulk deleting projects:", error);
    return { error: error.message, success: false };
  }
}

export async function updateProjectsDraftStatusBulk(projectIds = [], draft = false) {
  try {
    const ids = Array.from(new Set(projectIds.filter(Boolean)));
    if (!ids.length) return { success: true, updated: 0 };

    const batch = writeBatch(db);
    ids.forEach((projectId) => {
      batch.update(doc(db, "projects", projectId), {
        draft: Boolean(draft),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return { success: true, updated: ids.length };
  } catch (error) {
    console.error("Error bulk updating projects draft status:", error);
    return { error: error.message, success: false };
  }
}

export async function updateProjectsFeaturedStatusBulk(projectIds = [], featured = false) {
  try {
    const ids = Array.from(new Set(projectIds.filter(Boolean)));
    if (!ids.length) return { success: true, updated: 0 };

    const batch = writeBatch(db);
    ids.forEach((projectId) => {
      batch.update(doc(db, "projects", projectId), {
        featured: Boolean(featured),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return { success: true, updated: ids.length };
  } catch (error) {
    console.error("Error bulk updating projects featured status:", error);
    return { error: error.message, success: false };
  }
}
