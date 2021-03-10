# recursive-resize

This simple command-line tool resizes all images in a directory to a specified width, and outputs them in an output directory. It can also generate thumbnails of an even smaller size, all prefixed with "tn-".

This is meant to be used to quickly shrink a large amount of heavy files, to save on loading times and network usage. Images will maintain their aspect ratio. 

To install, use `npm install -g recursive-resize`

To run, you use `recursive-resize` (or if that's too many letters, you can use `recres` instead.)

## CLI Options

* `-i, --input`: Defines the input directory. Every .png, .jpg, and .jpeg file within the directory will be resized. Can
  * If no input directory is defined, the current directory will be used. **If you do this, make sure your output directory is NOT inside the working directory!** You should always define both input and output.
* `-o, --output`: Defines the output directory. The same file structure from the input directory will be created. Any existing files with the same filenames will be overwritten. 
  * If no output directory is defined, the current directory will be used. **If you do this, make sure you aren't outputting into your input directory!** You should always define both input and output.
* `-w, --width`: The new width of every image. Because aspect ratio is meant to be maintained there is no height option.
* `-t, --thumbnail`: The new width for each thumbnail. If not defined, no thumbnails will be generated. Thumbnail files are prefixed with "tn-" before the image's regular filename.
* `-d, --debug`: Print additional output.
* `-h, --help`: Shows these options.

If you want to overwrite your input directory with your output, you can use `./` as both the `-i` and `-o` arguments. You probably *shouldn't* do this though. And you also probably *shouldn't* use an output directory as an input directory.

## Examples

`recres -i fullsize-images -o public/images -w 2000 -t 256` Resizes all images from the directory fullsize-images and places it into the public/images directory at 2000px wide, along with thumbnails for each image that are 256px wide.

`recres -o ../newimages -w 6000` Resizes all images from current working directory newimages, sizes them up to 6000px across, and puts them into an outer folder.

`recres -i /home/user/images -w 25 -t 200 -d` Resizes all images from absolute directory /home/user/images to be 25px wide, with their thumbnails 200px wide. I dunno why you'd do this... but no judgement here. This also prints progress and extra information.
