import * as dotenv from 'dotenv'
import axios from 'axios'
import { Image, requestData } from './types'
import path from 'path'
import { createWriteStream } from 'fs'
import { ChildProcess, exec } from 'child_process'
import { readdir } from 'fs/promises'
dotenv.config()


const imageDir = path.resolve(__dirname, '../images')

const apiKey = process.env.PIXABAY_KEY

const page = Math.floor(Math.random() * 100);

const categories = ["backgrounds", "fashion", "nature", "science", "education", "feelings", "health", "people", "religion", "places", "animals", "industry", "computer", "food", "sports", "transportation", "travel", "buildings", "business", "music"]

const category = categories[Math.floor(Math.random() * categories.length)]

const url = `https://pixabay.com/api/?key=${apiKey}&editors_choice=true&safesearch=true&category=science&orientation=horizontal&min_width=1500&min_height=700&per_page=3&page=${page}&category=${category}`

async function getImages() {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'Accept-Encoding': '*'
            }
        });

        const { hits: images } = data as requestData;

        try {

            await downloadImage(images[0].largeImageURL)
        } catch (err) {
            console.log(err)
        }


    } catch (err) {
        console.log(err)
    }
}

async function downloadImage(url: string) {

    const fileName = path.basename(url)

    const dir = path.resolve(__dirname, '../images', fileName)
    const writer = createWriteStream(dir)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}


async function getNewImage(){

    let files = await readdir(imageDir);

   const currentWallpaper = await  getCurrentWallpaper() as string;

    const filtered = files.filter((file:string)=> file !== currentWallpaper)

    // console.log({filtered,currentWallpaper})

    const newFile = filtered[Math.floor(Math.random() * files.length)]

    return newFile

}


async function setWallpaper(image: string) {

    const imageFullPath = `file:///${path.resolve(__dirname, '../images', image)}`

    let childProcess : ChildProcess;

     childProcess = exec(`gsettings set org.gnome.desktop.background picture-uri-dark ${imageFullPath}`, (error, stdout, stderr) => {

        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        // console.log(`stdout: ${stdout}`);

        // childProcess.kill()
    })

    
}

function getCurrentWallpaper() {

    return new Promise((resolve,reject)=>{

        exec(`gsettings get org.gnome.desktop.background picture-uri`, (error, stdout, stderr) => {

            if (error) {
                // console.log(`error: ${error.message}`);
                reject(error)
                return false;
            }
            if (stderr) {
                // console.log(`stderr: ${stderr}`);
                return reject(stderr)
            }
    
            // console.log({ stdout })

            const fileName = path.basename(stdout.trim())

            resolve(fileName.split("'")[0]) // the result comes with a ' ans \n
        })

    })

    
}



async function changeWallPaper(){
    const newFile = await getNewImage();

    // console.log("going to change",newFile)
    await setWallpaper(newFile)

}

export const wallpaper =  {
    change : changeWallPaper,
    get : getImages
}


//TODO change wallpaper size

//# values for picture-options: ‘none’, ‘wallpaper’, ‘centered’, ‘scaled’, ‘stretched’, ‘zoom’, ‘spanned’
// gsettings set org.gnome.desktop.background picture-options 'scaled'
