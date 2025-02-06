import { useEffect } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function PictureForm() {
  const pictureFormRef = useRef(null);
  const updateUserPictureWithId = updateUserPicture.bind(null, user?._id);
  const [state, formAction, pending] = useActionState(
    updateUserPictureWithId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/auth/session");
    }
  }, [state]);

  const handleUpdatePicture = () => {
    pictureFormRef?.current?.requestSubmit();
  };

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
