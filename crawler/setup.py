from setuptools import setup

setup(
    name="ac-predictor-crawler",
    version="0.0.1",
    install_requires=[],
    extras_require={
    },
    entry_points={
        "console_scripts": [
            "ac-predictor-crawler = ac_predictor_crawler.main:main",
            "ac-predictor-crawler-runner = runner.main:main",
        ]
    }
)
