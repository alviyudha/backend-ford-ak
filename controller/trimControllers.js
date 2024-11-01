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

export const createTrims = async (req, res) => {
  const {
    trim,
    trimDetail,
    vehicleId,
    otrArea,
    otrPrice,
    urlYoutube,
    itemSpec1,
    itemSpec2,
    itemSpec3,
    linkPage,
  } = req.body;

  const backgroundImg = req.files?.backgroundImg
    ? req.files.backgroundImg[0]
    : null;
  const brochure = req.files?.brochure ? req.files.brochure[0] : null;
  const imgView = req.files?.imgView ? req.files.imgView[0] : null;

  if (!backgroundImg || !brochure || !imgView) {
    return res
      .status(400)
      .json({
        msg: "Background image, brochure, and image view are required.",
      });
  }
  const imgSize = backgroundImg.size;
  const imgExt = path.extname(backgroundImg.originalname);
  const imgName = backgroundImg.filename;
  const imgUrl = `${req.protocol}://${req.get("host")}/bg-img-car/${imgName}`;
  const allowedImgTypes = [".png", ".jpg", ".jpeg"];

  if (!allowedImgTypes.includes(imgExt.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid image type." });
  }
  if (imgSize > 5000000) {
    return res.status(422).json({ msg: "Image must be less than 5 MB." });
  }
  const pdfSize = brochure.size;
  const pdfExt = path.extname(brochure.originalname);
  const pdfName = brochure.filename;
  const pdfUrl = `${req.protocol}://${req.get("host")}/brochure/${pdfName}`;
  const allowedPdfTypes = [".pdf"];

  if (!allowedPdfTypes.includes(pdfExt.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid PDF type." });
  }
  if (pdfSize > 80000000) {
    return res.status(422).json({ msg: "PDF must be less than 80 MB." });
  }
  const imgViewSize = imgView.size;
  const imgViewExt = path.extname(imgView.originalname);
  const imgViewName = imgView.filename;
  const imgViewUrl = `${req.protocol}://${req.get(
    "host"
  )}/img-view/${imgViewName}`;

  if (!allowedImgTypes.includes(imgViewExt.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid image view type." });
  }
  if (imgViewSize > 5000000) {
    return res.status(422).json({ msg: "Image view must be less than 5 MB." });
  }

  try {
    const newTrim = await prisma.trim.create({
      data: {
        trim,
        trimDetail,
        otrArea,
        otrPrice,
        backgroundImg: imgName,
        urlBackgroundImg: imgUrl,
        brochure: pdfName,
        urlBrochure: pdfUrl,
        imgView: imgViewName,
        urlImgView: imgViewUrl,
        urlYoutube,
        itemSpec1,
        itemSpec2,
        itemSpec3,
        linkPage,
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });

    res.status(201).json({ msg: "Trim created successfully", data: newTrim });
  } catch (error) {
    console.error("Error creating trim:", error);
    res.status(500).json({ msg: "Failed to create trim." });
  }
};

export const getTrims = async (req, res) => {
  try {
    const response = await prisma.trim.findMany();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getTrimsByID = async (req, res) => {
  try {
    const response = await prisma.trim.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const updateTrims = async (req, res) => {
  const {
    trim,
    trimDetail,
    otrArea,
    otrPrice,
    urlYoutube,
    itemSpec1,
    itemSpec2,
    itemSpec3,
  } = req.body;

  const { id } = req.params;
  const backgroundImg = req.files?.backgroundImg ? req.files.backgroundImg[0] : null;
  const brochure = req.files?.brochure ? req.files.brochure[0] : null;
  const imgView = req.files?.imgView ? req.files.imgView[0] : null;

  try {
    const existingTrim = await prisma.trim.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        vehicle: true, // Include the vehicle to get the model
      },
    });

    if (!existingTrim) {
      return res.status(404).json({ msg: "Trim not found" });
    }

    // Construct linkPage as "model-trim"
    const linkPage = `${existingTrim.vehicle.model}-${trim}`;

    const updateData = {
      trim,
      trimDetail,
      otrArea,
      otrPrice,
      urlYoutube,
      itemSpec1,
      itemSpec2,
      itemSpec3,
      linkPage, // Set the constructed linkPage
    };

    if (backgroundImg) {
      const imgSize = backgroundImg.size;
      const imgExt = path.extname(backgroundImg.originalname);
      const imgName = backgroundImg.filename;
      const imgUrl = `${req.protocol}://${req.get("host")}/bg-img-car/${imgName}`;
      const allowedImgTypes = [".png", ".jpg", ".jpeg"];

      if (!allowedImgTypes.includes(imgExt.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid image type." });
      }
      if (imgSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB." });
      }
      safeDelete(`public/bg-img-car/${existingTrim.backgroundImg}`);
      updateData.backgroundImg = imgName;
      updateData.urlBackgroundImg = imgUrl;
    }

    if (brochure) {
      const pdfSize = brochure.size;
      const pdfExt = path.extname(brochure.originalname);
      const pdfName = brochure.filename;
      const pdfUrl = `${req.protocol}://${req.get("host")}/brochure/${pdfName}`;
      const allowedPdfTypes = [".pdf"];

      if (!allowedPdfTypes.includes(pdfExt.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid PDF type." });
      }
      if (pdfSize > 80000000) {
        return res.status(422).json({ msg: "PDF must be less than 80 MB." });
      }
      safeDelete(`public/brochure/${existingTrim.brochure}`);

      updateData.brochure = pdfName;
      updateData.urlBrochure = pdfUrl;
    }

    if (imgView) {
      const imgViewSize = imgView.size;
      const imgViewExt = path.extname(imgView.originalname);
      const imgViewName = imgView.filename;
      const imgViewUrl = `${req.protocol}://${req.get("host")}/img-view/${imgViewName}`;
      const allowedImgViewTypes = [".png", ".jpg", ".jpeg"];

      if (!allowedImgViewTypes.includes(imgViewExt.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid image type." });
      }
      if (imgViewSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5 MB." });
      }
      safeDelete(`public/img-view/${existingTrim.imgView}`);
      updateData.imgView = imgViewName;
      updateData.urlImgView = imgViewUrl;
    }

    const updatedTrim = await prisma.trim.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.status(200).json({ msg: "Trim updated successfully", data: updatedTrim });
  } catch (error) {
    console.error("Error updating trim:", error);
    res.status(500).json({ msg: "Failed to update trim." });
  }
};

export const deleteTrims = async (req, res) => {
  const { id } = req.params;

  try {
    const existingTrim = await prisma.trim.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingTrim) {
      return res.status(404).json({ msg: "Trim not found" });
    }
    if (existingTrim.backgroundImg) {
      const backgroundImgPath = `public/bg-img-car/${existingTrim.backgroundImg}`; // Update to correct directory
      safeDelete(backgroundImgPath);
    }
    if (existingTrim.brochure) {
      const brochurePath = `public/brochure/${existingTrim.brochure}`;
      safeDelete(brochurePath);
    }
    if (existingTrim.imgView) {
      const imgViewPath = `public/img-view/${existingTrim.imgView}`;
      safeDelete(imgViewPath);
    }

    await prisma.trim.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ msg: "Trim deleted successfully" });
  } catch (error) {
    console.error("Error deleting trim:", error);
    res.status(500).json({ msg: "Failed to delete trim." });
  }
};
