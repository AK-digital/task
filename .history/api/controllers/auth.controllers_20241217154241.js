// Logic for user sign up.
export function signUp(req, res, next) {
    const { lastName, firstName, email, password } = req.body
}

// Logic for user sign in.
export function signIn(req, res, next) {

}

// Refreshing the access token by giving a valid refresh token.
export function refreshAccessToken(req, res, next) {

}

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export function logout(req, res, next) {

}

