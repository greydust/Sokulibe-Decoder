#include <stdio.h>
#include <windows.h>
#include <fstream>
#include <errno.h>
#include <string>

#include "Include\AssetsFileFormat.h"
#include "Include\AssetsFileReader.h"
#include "Include\AssetsFileTable.h"
#include "Include\AssetsBundleFileFormat.h"
#include "Include\ClassDatabaseFile.h";

using namespace std;

std::ifstream::pos_type filesize(const char* filename)
{
    std::ifstream in(filename, std::ifstream::ate | std::ifstream::binary);
    return in.tellg(); 
}

string replace(const std::string& str, const std::string& from, const std::string& to) {
	string ret = str;
    size_t start_pos = ret.find(from);
    ret.replace(start_pos, from.length(), to);
	return ret;
}

void GetFilesInDirectory(std::vector<string> &out, const string &directory)
{
	HANDLE dir;
	WIN32_FIND_DATA file_data;

	if ((dir = FindFirstFile((directory + "/*.ab").c_str(), &file_data)) == INVALID_HANDLE_VALUE)
		return; /* No files found */

	do {
		const string file_name = file_data.cFileName;
		const string full_file_name = directory + "/" + file_name;
		const bool is_directory = (file_data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0;

		if (file_name[0] == '.') {
			continue;
		}

		if (is_directory) {
			continue;
		}

		out.push_back(full_file_name);
	} while (FindNextFile(dir, &file_data));

	FindClose(dir);
}

int main() {
	vector<string> files;
	GetFilesInDirectory(files, "ExtractedAssets/");

	for (int i=0 ; i<files.size() ; i++) {
		printf("Processing %s\n", files[i].c_str());

		FILE *pFile = fopen(files[i].c_str(), "rb");
		//AssetsFile assetsFile(AssetsReaderFromFile, (LPARAM)pFile); // I tried &AssetsReaderFromFile too since I'm not sure what's right here but it makes no difference

		if (pFile == NULL) {
			printf("read file failed, errno = %d\n", errno);
		} else {
			AssetsBundleFile bundleFile;
			bundleFile.Read(AssetsReaderFromFile, (LPARAM)pFile, AssetsVerifyLoggerToConsole, true);

			bool is6_compressed = false;
			if (bundleFile.bundleHeader3.fileVersion == 6)
			{
				is6_compressed = (bundleFile.bundleHeader6.flags & 0x3F) != 0;
				for (DWORD i = 0; i < bundleFile.listCount; i++)
				{
					for (DWORD k = 0; k < bundleFile.bundleInf6[i].blockCount; k++)
					{
						if ((bundleFile.bundleInf6[i].blockInf[k].flags & 0x3F) != 0)
						{
							is6_compressed = true;
							break;
						}
					}
				}
			}
			if (((bundleFile.bundleHeader3.fileVersion == 3) && !strcmp(bundleFile.bundleHeader3.signature, "UnityWeb"))
				|| is6_compressed)
			{
				//compressed, needs decompression first
				string unity3dFileName = replace(files[i], ".ab", ".unity3d");
				FILE *uncompressedFile = fopen(unity3dFileName.c_str(), "wb");
				bundleFile.Unpack(AssetsReaderFromFile, (LPARAM)pFile, AssetsWriterToFile, (LPARAM)uncompressedFile);
				fclose(uncompressedFile);

				bundleFile.Close();
				fclose(pFile);
				pFile = fopen(unity3dFileName.c_str(), "rb");
				bundleFile.Read(AssetsReaderFromFile, (LPARAM)pFile, AssetsVerifyLoggerToConsole, true);
			}

			if (bundleFile.bundleHeader3.fileVersion == 3) {
				int sizeOfArray = sizeof(bundleFile.assetsLists3->ppEntries) / sizeof(AssetsBundleEntry *);
				LPARAM newPFile = (LPARAM)pFile;
				AssetsFileReader assetReader;

				for (int j=0 ; i<sizeOfArray ; j++) {
					assetReader = bundleFile.MakeAssetsFileReader(AssetsReaderFromFile, &newPFile, bundleFile.assetsLists3->ppEntries[j]);

					string assetFileName = replace(files[i], ".ab", ".assets");
					FILE* writeToFile = fopen(assetFileName.c_str(), "wb");
					AssetsFile asset(assetReader, newPFile);
					std::vector<AssetsReplacer*> replacer;
					asset.Write(AssetsWriterToFile, (LPARAM)writeToFile, 0, replacer, 0);
					fclose(writeToFile);
				}
			} else if (bundleFile.bundleHeader3.fileVersion == 6) {
				LPARAM newPFile = (LPARAM)pFile;
				AssetsFileReader assetReader;

				for (int j=0 ; j<bundleFile.bundleInf6->directoryCount ; j++) {
					assetReader = bundleFile.MakeAssetsFileReader(AssetsReaderFromFile, &newPFile, &(bundleFile.bundleInf6->dirInf[j]));

					string assetFileName = replace(files[i], ".ab", ".assets");
					FILE* writeToFile = fopen(assetFileName.c_str(), "wb");
					AssetsFile asset(assetReader, newPFile);
					std::vector<AssetsReplacer*> replacer;
					asset.Write(AssetsWriterToFile, (LPARAM)writeToFile, 0, replacer, 0);
					fclose(writeToFile);
				}
			}

			bundleFile.Close();
			fclose(pFile);
		}
	}
}