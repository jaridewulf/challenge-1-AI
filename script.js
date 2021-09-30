{
    const $video = document.getElementById('video');
    let detector;
    let detections = [];
    const model = "../assets/ssd_mobilenet_v1_1_metadata_1.tflite";

    const $btn = document.getElementById('btn');
    
    const init = async () => {
        //Handle detection
        detector = ml5.objectDetector(model);
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        $video.srcObject = stream;

        const $canvas = document.getElementById('canvasA');
        const ctx = $canvas.getContext('2d');

        // bugfix safari
        if (!$video.captureStream) {
            $video.captureStream = () => stream;
        }

        const gotDetections = (error, results) => {
            console.log(results);
            if (error) {
                console.error(error);
            }
            detections = results;
            detector.detect($video, gotDetections);
            draw();
        }

        detector.detect($video, gotDetections);

        const draw = () => {
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
            ctx.drawImage($video, 0, 0);

            if(detections){
                for (let i = 0; i < detections.length; i++) {
                    let obj = detections[i];
                    ctx.beginPath();
                    ctx.rect(obj.x, obj.y, obj.width, obj.height);
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = "red";
                    ctx.stroke();
                    ctx.font = "15px Arial";
                    ctx.fillText(obj.label, obj.x+10, obj.y+20);
                }
            }
        }

        //Handle fetch
        const fetchRecipes = async () => {
            //TODO: Loop over objects, add label to array, convert array to usable string
            let fooditems = [];
            for (let i = 0; i < detections.length; i++) {
                let obj = detections[i];
                if(obj.label === "person"){
                    return;
                }else{
                    if(!fooditems.find(obj.label)){
                        fooditems.push(obj.label);
                    }
                    else{
                        return;
                    }
                }
            }
            fooditems = fooditems.toString().replace(",", "-").replace(" ", "-");

            console.log(fooditems);
            document.getElementById("demo").innerHTML = fooditems;

            const response = await fetch(`https://api.edamam.com/search?app_id=${data.app_id}&app_key=${data.key}&q=${fooditems}`);
            const recipes = await response.json();
            console.log(recipes);
        }

        $btn.addEventListener('click', fetchRecipes);
    }
    
    init();
}