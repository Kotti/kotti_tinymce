import os

from setuptools import find_packages
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

install_requires = [
    # Kotti with Bootstrap 3 is required
    'Kotti>=0.10dev',
],

setup(
    name='kotti_tinymce',
    version='0.5.3',
    description="TinyMCE plugins for Kotti",
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        "License :: OSI Approved :: MIT License",
    ],
    author='Andreas Kaiser',
    author_email='disko@binary-punks.com',
    url='https://github.com/Kotti/kotti_tinymce',
    keywords='tinymce image browser kotti cms pylons pyramid',
    license="BSD",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=install_requires,
    entry_points={
        'fanstatic.libraries': [
            "kotti_tinymce = kotti_tinymce:library",
        ],
    },
    message_extractors={
        "kotti_tinymce": [
            ("**.py", "lingua_python", None),
            ("**.pt", "lingua_xml", None),
        ],
    },
)
