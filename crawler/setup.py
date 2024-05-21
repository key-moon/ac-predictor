from setuptools import setup

setup(
    name="ac-predictor-crawler",
    version="0.0.1",
    install_requires=[
        "beautifulsoup4==4.12.2",
        "tqdm==4.65.0",
        "requests==2.31.0"
    ],
    packages=[
      "ac_predictor_crawler",
      "runner"
    ],
    extras_require={
    },
    entry_points={
        "console_scripts": [
            "ac-predictor-crawler = ac_predictor_crawler.main:main",
            "ac-predictor-crawler-update-aperfs = runner.main:do_update_aperfs",
            "ac-predictor-crawler-refresh-caches = runner.main:do_refresh_caches",
        ]
    }
)
