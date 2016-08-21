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
            Dictionary <string, Bitmap> mapImages = new Dictionary<string, Bitmap>();

            string[] files = Directory.GetFiles(s_pngDirectory, "*.png");
            foreach (string file in files)
            {
                Console.WriteLine("Processing " + file);
                if (file.Contains("a_tex"))
                {
                    Bitmap bm = new Bitmap(file);
                    int sharpPosition = file.LastIndexOf("#");
                    string newName = Path.GetFileName(file.Substring(0, sharpPosition - 1));
                    mapImages.Add(newName, bm);
                }
                else if (file.Contains("c_tex"))
                {
                    Bitmap cBM = new Bitmap(file);
                    int sharpPosition = file.LastIndexOf("#");
                    string newName = Path.GetFileName(file.Substring(0, sharpPosition - 1));
                    string newFileName = "ConvertedAssets/" + newName.Replace("_c_tex", "") + ".png";

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
                }
                else
                {
                    int sharpPosition = file.LastIndexOf("#");
                    string newFileName = "ConvertedAssets/" + Path.GetFileName((file.Substring(0, sharpPosition - 1) + ".png"));

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
