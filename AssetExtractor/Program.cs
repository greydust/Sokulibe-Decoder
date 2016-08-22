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

        private static string[] s_filesToDownload =
        {
            "un{0:D4}_up_c_tex.cpk",
            "un{0:D4}_up_a_tex.cpk",
            "un{0:D4}_mini_tex.cpk",
            "pi{0:D4}_tex.cpk",
            "pi{0:D4}_tex_a.cpk",
            "un{0:D4}_full_c_tex.cpk",
            "un{0:D4}_full_a_tex.cpk",
        };

        private static void DownloadAssets(int num, string targetFolder, string serverPath, string assetPath, bool overwrite) {
            Directory.CreateDirectory(targetFolder);

            assetPath = String.Format(assetPath, num);
            if (overwrite || !File.Exists(targetFolder + assetPath))
            {
                WebClient client = new WebClient();
                try
                {
                    client.DownloadFile(serverPath + assetPath, targetFolder + assetPath);
                }
                catch (Exception e)
                {

                }

                Console.WriteLine("Download Asset " + assetPath);
            }
        }

        static void Main(string[] args)
        {
            for (int i=1; i<=200; i++)
            {
                foreach (string file in s_filesToDownload)
                {
                    DownloadAssets(i, "RawAssets/", s_serverPath, file, false);
                }
            }
            foreach (string file in s_filesToDownload)
            {
                DownloadAssets(4000, "RawAssets/", s_serverPath, file, false);
            }

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

            Directory.CreateDirectory("ExtractedAssets/");
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
