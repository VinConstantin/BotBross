const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
    keyFilename: './gCloudKey.json'
  });


exports.getText = async function(parameter, cb){
    if(parameter == undefined) return undefined;
    client
        .textDetection(parameter)
        .then(results => {
            try {
                const detections = results[0].textAnnotations;
                cb(detections[0].description); 
            } catch (error) {
                cb("Not a picture / Cannot read");
                console.log(error);
            }
        });
}