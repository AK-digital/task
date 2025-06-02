/**
 * Extrait l'ID d'un objet qui peut être soit un string soit un objet avec _id
 * @param {string|Object} idOrObject - L'ID ou l'objet contenant l'ID
 * @returns {string|undefined} - L'ID extrait ou undefined
 */
export function extractId(idOrObject) {
  if (!idOrObject) return undefined;

  // Si c'est déjà un string, le retourner directement
  if (typeof idOrObject === "string") {
    return idOrObject;
  }

  // Si c'est un objet avec _id, retourner l'_id
  if (typeof idOrObject === "object" && idOrObject._id) {
    return idOrObject._id;
  }

  return undefined;
}
