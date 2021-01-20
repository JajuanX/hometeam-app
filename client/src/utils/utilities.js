export const collectIdsandDocs = doc => {
	return {
		id: doc.id,
		...doc.data()
		}
}