import { APIGatewayAuthorizerHandler, APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'


/**
    Custom authorizer is now deprecated and replaced with lambda authorizer.
    There are two types of lambda authorizers now
    1. Token-based lambda authorizers
    2. Request-based lambda authorizers 
 */


const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-7imzq2zn.us.auth0.com/.well-known/jwks.json'

var cachedSecret: string

export const handler: APIGatewayAuthorizerHandler =async (event:APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const keys = await getKeys(jwksUrl)

  // Although unlikely, checking to see if jwks did not return any keys

  if (!keys || !keys.length) {
    throw new Error("The JWKS endpoint did not return any keys")
  }

  const signingKeys = keys
  .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
              && key.kty === 'RSA' // We are only supporting RSA (RS256)
              && key.kid           // The `kid` must be present to be useful for later
              && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
  )

  // If at least one signing key doesn't exist we have a problem... Kaboom.
  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signature verification keys');
  }

  const signingKey = getSigningKey(jwt.header.kid, signingKeys)
  if (signingKey) return jwt.payload
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getKeys(url:string) {
  if (cachedSecret) {
    return cachedSecret
  }
  try{
    const data = await Axios.get(url)
    return data.data.keys
  }
  catch(e) {
    console.log("Unable to retrieve JWKS", e)
    return null
  }
}

function getSigningKey(keyIdentifier, keys) {
  const signingKey = keys.find(key => key.kid === keyIdentifier)

  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches ${keyIdentifier}`)
  }
  return signingKey
}
