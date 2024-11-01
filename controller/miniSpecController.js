import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
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

export const getMiniSpec = async (req, res) => {
  try {
    const response = await prisma.miniSpec.findMany();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getMiniSpecById = async (req, res) => {
  try {
    const response = await prisma.miniSpec.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getMiniSpecByTrimId = async (req, res) => {
    try {
      const response = await prisma.miniSpec.findMany({
        where: {
          trimId: Number(req.params.trimid),
        },
      });
      
      if (response.length === 0) {
        return res.status(404).json({ msg: "No MiniSpec found for this Trim ID." });
      }
  
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };

export const createMiniSpec = async (req, res) => {
  const { title, text, catMiniSpec, trimId } = req.body;
  const imgMiniSpec = req.file;

  if (!imgMiniSpec) {
    return res.status(400).json({ msg: "Image for mini spec is required." });
  }

  const imgSize = imgMiniSpec.size;
  const imgExt = path.extname(imgMiniSpec.originalname);
  const allowedImgTypes = [".png", ".jpg", ".jpeg"];
  const imgName = imgMiniSpec.filename;
  const imgUrl = `${req.protocol}://${req.get("host")}/img-minispec/${imgName}`;

  if (!allowedImgTypes.includes(imgExt.toLowerCase())) {
    fs.unlinkSync(path.join("public/img-minispec", imgName));
    return res.status(422).json({ msg: "Invalid image type." });
  }

  if (imgSize > 5000000) {
    fs.unlinkSync(path.join("public/img-minispec", imgName));
    return res.status(422).json({ msg: "Image must be less than 5 MB." });
  }

  try {
    if (!trimId || isNaN(trimId)) {
      fs.unlinkSync(path.join("public/img-minispec", imgName)); // Hapus file jika `trimId` tidak valid
      return res.status(400).json({ msg: "Invalid trimId." });
    }

    const newMiniSpec = await prisma.miniSpec.create({
      data: {
        title,
        text,
        imgMiniSpec: imgName,
        urlImgMiniSpec: imgUrl,
        catMiniSpec,
        trim: {
          connect: { id: parseInt(trimId, 10) },
        },
      },
    });

    res
      .status(201)
      .json({ msg: "MiniSpec created successfully", data: newMiniSpec });
  } catch (error) {
    console.error("Error creating MiniSpec:", error);
    fs.unlinkSync(path.join("public/img-minispec", imgName)); // Hapus file jika terjadi error di database
    res.status(500).json({ msg: "Failed to create MiniSpec." });
  }
};
export const updateMiniSpec = async (req, res) => {
  const { id } = req.params;
  const { title, text, catMiniSpec, trimId } = req.body;
  const imgMiniSpec = req.file; 

  try {
    const existingMiniSpec = await prisma.miniSpec.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!existingMiniSpec) {
      return res.status(404).json({ msg: "MiniSpec not found." });
    }

    let updatedData = {
      title,
      text,
      catMiniSpec,
      trim: {
        connect: { id: parseInt(trimId, 10) },
      },
    };

    if (imgMiniSpec) {
      const imgSize = imgMiniSpec.size;
      const imgExt = path.extname(imgMiniSpec.originalname);
      const allowedImgTypes = [".png", ".jpg", ".jpeg"];
      const imgName = imgMiniSpec.filename;
      const imgUrl = `${req.protocol}://${req.get(
        "host"
      )}/img-minispec/${imgName}`;

      if (!allowedImgTypes.includes(imgExt.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid image type." });
      }

      if (imgSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB." });
      }

      // Delete the old image
      const oldImagePath = path.join(
        "public/img-minispec",
        existingMiniSpec.imgMiniSpec
      );
      safeDelete(oldImagePath);

      // Update image data
      updatedData.imgMiniSpec = imgName;
      updatedData.urlImgMiniSpec = imgUrl;
    }

    // Update the miniSpec in the database
    const updatedMiniSpec = await prisma.miniSpec.update({
      where: { id: parseInt(id, 10) },
      data: updatedData,
    });

    res
      .status(200)
      .json({ msg: "MiniSpec updated successfully", data: updatedMiniSpec });
  } catch (error) {
    console.error("Error updating MiniSpec:", error);
    res.status(500).json({ msg: "Failed to update MiniSpec." });
  }
};

export const deleteMiniSpec = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the miniSpec to get the image path before deleting
    const miniSpec = await prisma.miniSpec.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!miniSpec) {
      return res.status(404).json({ msg: "MiniSpec not found." });
    }

    const imagePath = path.join("public/img-minispec", miniSpec.imgMiniSpec);
    safeDelete(imagePath);

    // Delete the miniSpec record from the database
    await prisma.miniSpec.delete({ where: { id: parseInt(id, 10) } });

    res.status(200).json({ msg: "MiniSpec deleted successfully." });
  } catch (error) {
    console.error("Error deleting MiniSpec:", error);
    res.status(500).json({ msg: "Failed to delete MiniSpec." });
  }
};
