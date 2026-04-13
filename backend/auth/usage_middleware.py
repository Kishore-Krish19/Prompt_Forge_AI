from fastapi import Request
from .models import increment_usage
import json

async def usage_middleware(request: Request, call_next):
    response = await call_next(request)

    # Only increment for POST endpoints that include a model name and when user is authenticated
    try:
        if request.method == 'POST' and request.url.path in ['/analyze', '/optimize', '/score', '/benchmark']:
            body = await request.json()
            model = body.get('model')
            # map model name to provider key
            provider_map = {
                'groq': 'gpt',
                'huggingface': 'claude',
                'gemini': 'gemini',
                'gpt': 'gpt',
                'claude': 'claude'
            }
            provider = provider_map.get(model)
            # extract user from Authorization header if present
            auth = request.headers.get('authorization')
            if provider and auth and auth.lower().startswith('bearer '):
                token = auth.split(' ', 1)[1]
                # decode token locally without verifying here to extract sub (email)
                from jose import jwt
                import os
                JWT_SECRET = os.environ.get('JWT_SECRET', 'devsecret')
                JWT_ALGO = 'HS256'
                try:
                    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
                    email = payload.get('sub')
                    if email:
                        try:
                            await increment_usage(email, provider)
                        except Exception:
                            pass
                except Exception:
                    pass
    except Exception:
        pass

    return response
