const core = require('@actions/core');
const AWS = require('aws-sdk');

/** Handles the error coming from the describeImages call
 * @param {object} error - Error that came from the catch
 * @param {string} imageTag - Tag of the image from input
*/
function handleError(error, imageTag) {
  if (error.code === 'ImageNotFoundException') {
    console.log(`Image doesn't exists with the tag ${imageTag}`);
    core.error('The image you are trying to deploy doesnt exists.');
    core.setFailed(`Image doesn't exists with the tag ${imageTag}`);
  } else {
    console.error(error);
    core.setFailed(`An error ocurred`);
  }
}

/** In case of a successful call from describeImages, this handles result
 * @param {object} result - Result from the describeImages call
 * @param {string} imageTag - Tag of the image from input
*/
function handleSucess(result, imageTag) {
  console.log(`Found image with tag ${imageTag}`);
  console.log(result);
  console.log('Success');
  core.notice('Image found correctly.');
}

const regionName = core.getInput('region');
const ecrRepo = core.getInput('ecr-repository');
const imageTag = core.getInput('image-tag');
const ecrClient = new AWS.ECR({region: regionName});
const params = {
  imageIds: [
    {
      imageTag: imageTag,
    },
  ],
  repositoryName: ecrRepo,
};
console.log(`Getting images with tag ${params.imageIds[0].imageTag}...`);
ecrClient.describeImages(params).promise()
    .then((result) => handleSucess(result, imageTag))
    .catch((result) => handleError(result, imageTag));
