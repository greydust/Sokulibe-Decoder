using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace AssetExtractor
{
    class Program
    {
        private static string s_serverPath = "http://combo-cdn.sega-net.jp/prod/20160817/assetbundle/android5/";
        private static string s_fullImageColor = "un{0:D4}_up_c_tex.cpk";
        private static string s_fullImageAlpha = "un{0:D4}_up_a_tex.cpk";
        private static string s_icon = "un{0:D4}_mini_tex.cpk";

        private static void DownloadAssets(int num, string targetFolder, string serverPath, string assetPath, bool overwrite) {
            Directory.CreateDirectory(targetFolder);

            assetPath = String.Format(assetPath, num);
            if (overwrite || !File.Exists(targetFolder + assetPath))
            {
                WebClient client = new WebClient();
                client.DownloadFile(serverPath + assetPath, targetFolder + assetPath);

                Console.WriteLine("Download Asset " + assetPath);
            }
        }

        static void Main(string[] args)
        {
            for (int i=21; i<=143; i++)
            {
                DownloadAssets(i, "RawAssets/", s_serverPath, s_fullImageColor, false);
                DownloadAssets(i, "RawAssets/", s_serverPath, s_fullImageAlpha, false);
                DownloadAssets(i, "RawAssets/", s_serverPath, s_icon, false);
            }
            DownloadAssets(4000, "RawAssets/", s_serverPath, s_fullImageColor, false);
            DownloadAssets(4000, "RawAssets/", s_serverPath, s_fullImageAlpha, false);
            DownloadAssets(4000, "RawAssets/", s_serverPath, s_icon, false);

            string[] files = Directory.GetFiles("RawAssets/", "*.cpk");
            foreach (string file in files)
            {
                if (!File.Exists(file.Replace(".cpk", ".ab").Replace("RawAssets", "ExtractedAssets")))
                {
                    Console.WriteLine("Convert Asset " + file);

                    Process process = new Process();
                    process.StartInfo.FileName = "CriPakTools.exe";
                    process.StartInfo.Arguments = file + " ALL";
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    process.StartInfo.UseShellExecute = false;
                    process.Start();
                    process.WaitForExit();
                }
            }

            string[] extractedFiles = Directory.GetFiles("/", "*.ab");
            foreach (string extractedFile in extractedFiles)
            {
                FileInfo fileInfo = new FileInfo(extractedFile);
                // to remove name collusion
                if (!File.Exists("ExtractedAssets/" + extractedFile))
                {
                    fileInfo.MoveTo("ExtractedAssets/" + extractedFile);
                }
                else
                {
                    fileInfo.Delete();
                }
            }

            { 
                Console.WriteLine("Extract Assets");

                Process process = new Process();
                process.StartInfo.FileName = "AssetBundleExtractor.exe";
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                process.StartInfo.UseShellExecute = false;
                process.Start();
                process.WaitForExit();
            }
        }
    }
}
