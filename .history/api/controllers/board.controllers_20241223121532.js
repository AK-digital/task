export async function saveBoard(req, res, next) {
  try {
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getBoard(req, res, next) {}

export async function getBoards(req, res, next) {}

export async function updateBoard(req, res, next) {}

export async function deleteBoard(req, res, next) {}
