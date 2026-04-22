from fastapi import Request
import json


async def usage_middleware(request: Request, call_next):
    """Middleware that decodes the JWT (if present) and attaches the user's email to request.state.
    Actual usage logging is performed in the endpoint handlers after successful AI responses to ensure
    logs are only written on success and to use the provider actually used.
    """
    # Attach user email to request.state for endpoint handlers
    try:
        auth = request.headers.get('authorization')
        if auth and auth.lower().startswith('bearer '):
            token = auth.split(' ', 1)[1]
            from jose import jwt
            from utils.config import JWT_SECRET
            JWT_ALGO = 'HS256'
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
                email = payload.get('sub')
                if email:
                    request.state.user_email = email
            except Exception:
                # ignore invalid tokens here; downstream auth will enforce
                request.state.user_email = None
        else:
            request.state.user_email = None
    except Exception:
        request.state.user_email = None

    response = await call_next(request)
    return response
