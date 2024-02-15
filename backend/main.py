#!/usr/bin/env python

import uvicorn


from app.settings import settings


if __name__ == '__main__':
    uvicorn.run(
        'app.app:app',
        host=settings.app_host,
        port=settings.app_port,
        debug=settings.app_debug,
        reload=settings.app_reload
    )
