import { PrismaClient } from "@prisma/client";
import path from 'path'
import fs from 'fs'
const prisma = new PrismaClient();


const safeDelete = (path) => {
    console.log(`Attempting to delete: ${path}`); 
    try {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log(`Deleted: ${path}`);
        } else {
            console.log(`${path} not found, but continuing.`);
        }
    } catch (error) {
        throw new Error(`Failed to delete ${path}: ${error.message}`);
    }
  };

  export const getColor  = async (req,res) =>{
    try {
        const response = await prisma.color.findMany()
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const getColorbyId  = async (req,res) =>{
    try {
        
        const response = await prisma.color.findUnique({
            where:{
                id : Number( req.params.id)
            }
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

export const createColor = async (req, res) => {
    const { title,text,backgroundColor, descColor, trimId } = req.body; 
    const colorsImageFile = req.file; 

    if (!colorsImageFile) {
        return res.status(400).json({ msg: "Image file is required." });
    }

    const imgSize = colorsImageFile.size;
    const imgExt = path.extname(colorsImageFile.originalname);
    const imgName = colorsImageFile.filename;
    const imgUrl = `${req.protocol}://${req.get("host")}/cars-color/${imgName}`;
    const allowedImgTypes = ['.png', '.jpg', '.jpeg'];

    if (!allowedImgTypes.includes(imgExt.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid image type." });
    }
    if (imgSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB." });
    }
 
    try {
        const newColor = await prisma.color.create({
            data: {
                title,
                text,
                backgroundColor,
                descColor,
                trimId: parseInt(trimId), 
                colorsImage: imgName,
                urlcolorsImage: imgUrl
            }
        });

        res.status(201).json({ msg: "Color created successfully", data: newColor });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Failed to create color." });
    }
};

export const updateColor = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ msg: "Invalid ID format" });
    }

    const { title,text,backgroundColor, descColor, vehicleId } = req.body;
    const updatedData = {
        title,
        text,
        backgroundColor,
        descColor,
        vehicleId,
    };

    const newColorsImage = req.file; // Assuming Multer is set to handle single file upload as 'colorsImage'

    try {
        const currentData = await prisma.color.findUnique({
            where: { id }
        });

        if (!currentData) {
            return res.status(404).json({ msg: "Color not found" });
        }

        if (newColorsImage) {
            const imgSize = newColorsImage.size;
            const imgExt = path.extname(newColorsImage.originalname);
            const allowedImgTypes = ['.png', '.jpg', '.jpeg'];

            if (!allowedImgTypes.includes(imgExt.toLowerCase()) || imgSize > 5000000) {
                return res.status(422).json({ msg: "Invalid image type or size. Image must be less than 5 MB and of type PNG, JPG, or JPEG." });
            }

            updatedData.colorsImage = newColorsImage.filename;
            updatedData.urlcolorsImage = `${req.protocol}://${req.get("host")}/cars-color/${newColorsImage.filename}`;
            safeDelete(`./public/cars-color/${currentData.colorsImage}`);
        }

        const updatedColor = await prisma.color.update({
            where: { id },
            data: updatedData
        });

        res.status(200).json({ msg: "Color updated successfully", data: updatedColor });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Failed to update color." });
    }
};


export const deleteColor  = async (req,res) =>{
    try {
        const color = await prisma.color.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!color) {
            return res.status(404).json({ msg: "Data not found" });
        }

        // console.log(`Working Directory: ${process.cwd()}`); 
        const colorsImage = `./public/cars-color/${color.colorsImage}`;

        safeDelete(colorsImage);

        await prisma.color.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.status(200).json({ msg: "color deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Failed to delete color data. " + error.message });
    }
}