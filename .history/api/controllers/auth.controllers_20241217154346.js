// Logic for user sign up.
export async function signUp(req, res, next) {
    try {

        const { lastName, firstName, email, password } = req.body

        // if(!lastName || !firstName || !email || !password) {
        //     return res?
        // };
    } catch (err) {
        return res.status(500)
    }
};

// Logic for user sign in.
export function signIn(req, res, next) {

};

// Refreshing the access token by giving a valid refresh token.
export function refreshAccessToken(req, res, next) {

};

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export function logout(req, res, next) {

};

