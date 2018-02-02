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

exports.getLabel = async function(parameter, cb){
    if(parameter == undefined) return undefined;
    client
        .labelDetection(parameter)
        .then(results => {
            try {
                const labels = results[0].labelAnnotations;
                cb(labels[0].description);
            } catch (error) {
                cb("Cannot find a thing");
                console.log(error);
            }
            
        });
}