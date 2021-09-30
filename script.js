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

            if (detections) {
                for (let i = 0; i < detections.length; i++) {
                    let obj = detections[i];
                    ctx.beginPath();
                    ctx.rect(obj.x, obj.y, obj.width, obj.height);
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = "red";
                    ctx.stroke();
                    ctx.font = "15px Arial";
                    ctx.fillText(obj.label, obj.x + 10, obj.y + 20);
                }
            }
        }

        //Handle fetch
        const fetchRecipes = async () => {
            let fooditemsSet = new Set(detections.map(item => item.label));
            fooditemsSet.delete("person");
            let fooditems = Array.from(fooditemsSet);
            console.log("AM LOGGING");
            console.log(fooditems);
            
            fooditems = fooditems.toString().replaceAll(",", "-").replaceAll(" ", "-");


            const response = await fetch(`https://api.edamam.com/search?app_id=01f78b57&app_key=4b42b02ad0e617c8cadc473cf21f0076&q=${fooditems}`);
            const recipes = await response.json();
            renderRecipes(recipes.hits);
        }

        //Render recipes onto html
        const renderRecipes = (recipes) => {
            let text = "<ul>";
            recipes.forEach(createItem);
            text += "</ul>";
            document.getElementById("recipes").innerHTML = text;

            function createItem(value) {
                console.log("1 value is", value);
                text += "<li><a href=" + value.recipe.shareAs + " target=_blank><img src=" + value.recipe.image + " </img>" + "<h3>" + value.recipe.label + "</h3></a></li>";
            }
        }

        $btn.addEventListener('click', fetchRecipes);
    }

    init();
}