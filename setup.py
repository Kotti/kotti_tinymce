import os
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

setup(name='kotti_tinymce',
      version='0.2.5',
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
      url='https://github.com/disko/kotti_tinymce',
      keywords='tinymce image browser kotti cms pylons pyramid',
      license="MIT",
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
        'js.tinymce<4.0-dev',  # TinyMCE 4.x will likely have an incompatible plugin API
        'Kotti>=0.7dev',  # Kotti with fanstatic is required
        'Babel',
        'pytest', ],
      entry_points="""\
      [fanstatic.libraries]
      tinymce = kotti_tinymce:library
      """,
      message_extractors={"kotti_tinymce": [
        ("**.py", "lingua_python", None),
        ("**.pt", "lingua_xml", None),
        ]},
      )
