export default function PictureForm() {
  return (
    <form
      action={pictureFormAction}
      ref={pictureFormRef}
      className={styles.pictureForm}
    >
      <input type="hidden" name="userId" value={user?._id} />
      <div
        className={styles.picture}
        onMouseEnter={() => setEditImg(true)}
        onMouseLeave={() => setEditImg(false)}
      >
        <Image
          src={user?.picture || "/default-pfp.webp"}
          alt={`Photo de profil de ${user?.firstName}`}
          width={120}
          height={120}
          quality={100}
          className={styles.profileImage}
        />
        {editImg && (
          <label htmlFor="picture" className={styles.editPicture}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </label>
        )}
        <input
          type="file"
          name="picture"
          id="picture"
          hidden
          onChange={handleUpdatePicture}
        />
      </div>
    </form>
  );
}
