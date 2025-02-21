import { UserManager } from 'oidc-client-ts'
import type { components } from '@/api/api'

export const PROVIDER_ID_KEY = 'oauth_provider_id'

export const createUserManager = (
    config: components['schemas']['OAuthProvider']
) => {
    const userManager = new UserManager({
        authority: config.authority,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        response_type: 'code',
        automaticSilentRenew: true,
        includeIdTokenInSilentRenew: true,
        extraQueryParams: {
            // force google to give us a refresh token
            access_type: 'offline',
            prompt: 'consent',
        },
    })

    return userManager
}
