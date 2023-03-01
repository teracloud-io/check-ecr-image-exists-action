const core = require('@actions/core');
const AWS = require('aws-sdk');

const listImages = async (params, ecrClient) => {
  console.log(`Getting repository images...`);
  const results = await ecrClient.listImages(params).promise();
  console.log(`Success. Got ${results.deployments.length} deployments`);
  return results;
};

const filterResults = (results, imageTag) => {
  const imageIds = results.imageIds;
  const tags = imageIds.map(function(image) {
    return image.imageTag;
  });

  if (tags.includes(imageTag)) {
    console.log(`The image tag ${imageTag} exists on the repo`);
    core.setOutput('exists', 1);
  } else {
    console.log(`The image tag ${imageTag} doesn't exists on the repo`);
    core.setOutput('exists', 0);
  }
};

const catchError = (error) => {
  console.error(error);
  core.setFailed(error);
};

try {
  const regionName = core.getInput('region');
  const ecrRepo = core.getInput('ecr-repository');
  const imageTag = core.getInput('image-tag');
  const ecrClient = new AWS.ECR({region: regionName});
  const params = {
    filter: {
      tagStatus: 'TAGGED',
    },
    repositoryName: ecrRepo,
  };
  listImages(params, ecrClient)
      .then((results) => filterResults(results, imageTag))
      .catch(catchError);
} catch (error) {
  core.setFailed(error.message);
}
