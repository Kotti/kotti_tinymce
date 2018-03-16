import os

from setuptools import find_packages
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

install_requires = [
    # Kotti with ``kotti_image`` add on is required
    'Kotti>=1.3',
],

# copied from Kotti, necessary because extras are not supported in
# ``extras_require``.  See https://github.com/pypa/pip/issues/3189
tests_require = [
    'kotti_image>=1.0.1',
    'WebTest',
    'mock',
    'Pillow',  # thumbnail filter in depot tween tests
    'py>=1.4.29',
    'pyquery',
    'pytest>=3.0.0',
    'pytest-cov',
    'pytest-pep8!=1.0.3',
    'pytest-travis-fold',
    'pytest-virtualenv',
    'pytest-xdist',
    'tox',
    'zope.testbrowser>=5.0.0',
    ]

# copied from Kotti, necessary because extras are not supported in
# ``extras_require``.  See https://github.com/pypa/pip/issues/3189
development_requires = [
    'check-manifest',
    'pipdeptree',
    'pyramid_debugtoolbar',
]

setup_requires = [
    'setuptools_git>=0.3',
]

setup(
    name='kotti_tinymce',
    version='0.7.0',
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
    setup_requires=setup_requires,
    tests_require=tests_require,
    extras_require={
        'testing': tests_require,
        'development': development_requires,
    },
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
