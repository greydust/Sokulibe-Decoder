using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;


namespace PNGProcessor
{
    class Program
    {
        private static string s_pngDirectory = "ExtractedAssets/Texture2D/";
        static void Main(string[] args)
        {
            Directory.CreateDirectory("ConvertedAssets/");
            Directory.CreateDirectory("ConvertedAssets/Mini");
            Directory.CreateDirectory("ConvertedAssets/Full");
            Directory.CreateDirectory("ConvertedAssets/Portrait");
            Directory.CreateDirectory("ConvertedAssets/Icon");
            Directory.CreateDirectory("ConvertedAssets/Other");
            Dictionary<string, Bitmap> mapImages = new Dictionary<string, Bitmap>();

            string[] files = Directory.GetFiles(s_pngDirectory, "*.png");
            foreach (string file in files)
            {
                Console.WriteLine("Processing " + file);

                string newName = Path.GetFileNameWithoutExtension(file);
                int sharpPosition = file.LastIndexOf("#");
                if (sharpPosition >= 0)
                {
                    newName = Path.GetFileNameWithoutExtension(file.Substring(0, sharpPosition - 1));
                }

                if (file.Contains("a_tex"))
                {
                    Bitmap bm = new Bitmap(file);
                    mapImages.Add(newName, bm);
                }
                else if (file.Contains("c_tex"))
                {
                    Bitmap cBM = new Bitmap(file);
                    string newFileName = "";
                    if (newName.Contains("_up_"))
                    {
                        newFileName = "ConvertedAssets/Portrait/" + newName.Replace("_c_tex", "") + ".png";
                    }
                    else if (newName.Contains("_full_"))
                    {
                        newFileName = "ConvertedAssets/Full/" + newName.Replace("_c_tex", "") + ".png";
                    }
                    else
                    {
                        newFileName = "ConvertedAssets/Other/" + newName.Replace("_c_tex", "") + ".png";
                    }

                    string targetName = newName.Replace("c_tex", "a_tex");
                    Bitmap aBM = mapImages[targetName];
                    mapImages.Remove(targetName);

                    Bitmap result = new Bitmap(aBM.Width, aBM.Height);
                    for (int i = 0; i < result.Width; i++)
                    {
                        for (int j = 0; j < result.Height; j++)
                        {
                            result.SetPixel(i, j, Color.FromArgb(aBM.GetPixel(i, j).R, cBM.GetPixel(i, j)));
                        }
                    }
                    result.RotateFlip(RotateFlipType.Rotate180FlipX);
                    result.Save(newFileName, System.Drawing.Imaging.ImageFormat.Png);
                    result.Dispose();
                    result = null;
                    cBM.Dispose();
                    cBM = null;
                    aBM.Dispose();
                    aBM = null;
                }
                else if (Path.GetFileName(file).StartsWith("pi") && !file.Contains("_tex_a") && file.Contains("_tex"))
                {
                    Bitmap bm = new Bitmap(file);
                    mapImages.Add(newName, bm);
                }
                else if (Path.GetFileName(file).StartsWith("pi") && file.Contains("_tex_a"))
                {
                    Bitmap aBM = new Bitmap(file);

                    string targetName = newName.Replace("_tex_a", "_tex");
                    string newFileName = "ConvertedAssets/Icon/" + targetName + ".png";
                    Bitmap cBM = mapImages[targetName];
                    mapImages.Remove(targetName);

                    Bitmap result = new Bitmap(aBM.Width, aBM.Height);
                    for (int i = 0; i < result.Width; i++)
                    {
                        for (int j = 0; j < result.Height; j++)
                        {
                            result.SetPixel(i, j, Color.FromArgb(aBM.GetPixel(i, j).R, cBM.GetPixel(i, j)));
                        }
                    }
                    result.RotateFlip(RotateFlipType.Rotate180FlipX);
                    result.Save(newFileName, System.Drawing.Imaging.ImageFormat.Png);
                    result.Dispose();
                    result = null;
                    cBM.Dispose();
                    cBM = null;
                    aBM.Dispose();
                    aBM = null;
                }

                else if (file.Contains("mini_tex"))
                {
                    string newFileName = "ConvertedAssets/Mini/" + newName + ".png";

                    using (Image img = Image.FromFile(file))
                    {
                        //rotate the picture by 90 degrees and re-save the picture as a Jpeg
                        img.RotateFlip(RotateFlipType.Rotate180FlipX);
                        img.Save(newFileName, System.Drawing.Imaging.ImageFormat.Png);
                    }
                }
                else
                {
                    string newFileName = "ConvertedAssets/Other/" + newName + ".png";

                    using (Image img = Image.FromFile(file))
                    {
                        //rotate the picture by 90 degrees and re-save the picture as a Jpeg
                        img.RotateFlip(RotateFlipType.Rotate180FlipX);
                        img.Save(newFileName, System.Drawing.Imaging.ImageFormat.Png);
                    }
                }
            }
        }
    }
}
