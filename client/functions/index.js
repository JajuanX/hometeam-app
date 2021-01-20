const functions = require('firebase-functions');

const {Storage} = require('@google-cloud/storage');

const gcs = new Storage();

const sharp = require('sharp');
const fs = require('fs-extra');

const os = require('os');
const path = require('path');
const uuid = require('uuid');

exports.resizeImages = functions.storage.object().onFinalize(async object => {
	try {
		// generate a unique name we'll use for the temp directories
		const uniqueName = uuid.v1();

		// Get the bucket original image was uploaded to
		const bucket = gcs.bucket(object.bucket);

		// Set up bucket directory
		const filePath = object.name;
		const fileName = filePath.split('/').pop();
		const bucketDir = path.dirname(filePath);

		// create some temp working directories to process images
		const workingDir = path.join(os.tmpdir(), `images_${uniqueName}`);
		const tmpFilePath = path.join(workingDir, `source_${uniqueName}.png`);

		// We dont want to process images already resized
		if (fileName.includes('image@') || !object.contentType.includes('image')) {
			console.log('Exiting image resizer!');
			return false;
		}

		// Ensure directory exists
		await fs.ensureDir(workingDir);

		// Download source file
		await bucket.file(filePath).download({
			destination: tmpFilePath,
		});

		// Resize images
		const sizes = [128, 256, 300, 600];
		const uploadPromises = sizes.map(async size => {
			const thumbName = `image@${size}_${fileName}`;
			const thumbPath = path.join(workingDir, thumbName);

			if (size < 300) {
				// Square aspect ratio
				// Good for profile images
				await sharp(tmpFilePath).resize(size, size).toFile(thumbPath);
			} else {
				// 16:9 aspect ratio
				let height = Math.floor(size * 0.5625);

				await sharp(tmpFilePath).resize(size, height).toFile(thumbPath);
			}

			// upload to original bucket
			return bucket.upload(thumbPath, {
				destination: path.join(bucketDir, thumbName),
			});
		});

		// Process promises outside of the loop for performance purposes
		await Promise.all(uploadPromises);

		// Remove the temp directories
		await fs.remove(workingDir);
		await fs.remove(bucketDir);

		return Promise.resolve();
	} catch (error) {
		// If we have an error, return it
		// This will allow us to view it in the firebase function logs
		return Promise.reject(error);
	}
});
