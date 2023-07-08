from setuptools import setup

setup(
    name="ac-predictor-indexer",
    version="0.0.1",
    install_requires=[],
    extras_require={
    },
    entry_points={
        "console_scripts": [
            "ac-predictor-indexer = app.main:main",
        ]
    }
)
