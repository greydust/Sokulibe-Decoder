#pragma once
#ifndef __AssetsTools__AssetsFileFormat_Header
#define __AssetsTools__AssetsFileFormat_Header
#include <vector>
#include "defines.h"
#include "AssetsReplacer.h"

#ifndef POINTERTYPE
typedef unsigned __int64 QWORD;
#ifdef WIN64
#define POINTERTYPE QWORD
#else
#define POINTERTYPE DWORD
#endif
#endif

#ifdef ASSETSTOOLS_EXPORTS
#define ASSETSTOOLS_API __declspec(dllexport) 
#else
#define ASSETSTOOLS_API __declspec(dllimport) 
typedef unsigned __int64 QWORD;
#endif

#ifndef __AssetsTools_AssetsFileFunctions_Read
#define __AssetsTools_AssetsFileFunctions_Read
typedef QWORD(_cdecl *AssetsFileReader)(QWORD pos, QWORD count, void *pBuf, LPARAM par);
typedef void(_cdecl *AssetsFileVerifyLogger)(char *message);
#endif
#ifndef __AssetsTools_AssetsFileFunctions_Write
#define __AssetsTools_AssetsFileFunctions_Write
typedef QWORD(_cdecl *AssetsFileWriter)(QWORD pos, QWORD count, const void *pBuf, LPARAM par);
#endif

struct AssetFile;

template<class T> inline T SwapEndians(T old)
{
	T ret; size_t sizeof_T = sizeof(T);
	for (size_t i = 0; i < sizeof_T; i++)
		((BYTE*)&ret)[sizeof_T - i - 1] = ((BYTE*)&old)[i];
	return ret;
}
template<class T> inline void SwapEndians_(T& _old)
{
	T old = _old;
	T ret; size_t sizeof_T = sizeof(T);
	for (size_t i = 0; i < sizeof_T; i++)
		((BYTE*)&ret)[sizeof_T - i - 1] = ((BYTE*)&old)[i];
	_old = ret;
}
ASSETSTOOLS_API DWORD SwapEndians(DWORD old);
ASSETSTOOLS_API void SwapEndians_(DWORD& old);

ASSETSTOOLS_API bool StringIsValid(char *str, int len);

ASSETSTOOLS_API bool HasName(DWORD type);

//for assets that begin with a m_Name field
struct AssetFile
{
	unsigned int filenameSize;		//0x00 //little-endian
	BYTE data[1];					//0x04

	ASSETSTOOLS_API char *GetFileName(char *outbuf, unsigned int outbufLen, int classId);
	ASSETSTOOLS_API BYTE *GetFileData();
	ASSETSTOOLS_API DWORD GetFileDataIndex();
};

#define AssetFileInfo_MaxSize 25
class AssetFileInfo
{
	public:
		unsigned __int64 index;			//0x00 //little-endian //version < 0x0E : only DWORD
		DWORD offs_curFile;				//0x08 //little-endian
		DWORD curFileSize;				//0x0C //little-endian
		DWORD curFileType;				//0x10 //little-endian
		//inheritedUnityClass : for Unity classes, this is curFileType; for MonoBehaviours, this is 114
		WORD inheritedUnityClass;		//0x14 //little-endian (MonoScript)//version < 0x0B : unknown1 is DWORD, no empty1 exists
		//scriptIndex : for Unity classes, this is 0xFFFF; for MonoBehaviours, this is the index of the script in the MonoManager asset
		WORD scriptIndex;				//0x16 //little-endian
		BYTE unknown1;					//0x18 //only version >= 0x0F //with alignment always a DWORD
		ASSETSTOOLS_API static DWORD GetSize(DWORD version);
		ASSETSTOOLS_API QWORD Read(DWORD version, QWORD pos, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD Write(DWORD version, QWORD pos, AssetsFileWriter writer, LPARAM writerPar);
};

struct AssetFileList
{
	unsigned int sizeFiles;			//0x00 //little-endian
	AssetFileInfo fileInfs[1];		//0x04

	ASSETSTOOLS_API unsigned int GetSizeBytes(DWORD version);
	ASSETSTOOLS_API QWORD Read(DWORD version, QWORD pos, AssetsFileReader reader, LPARAM readerPar);
	ASSETSTOOLS_API QWORD Write(DWORD version, QWORD pos, AssetsFileWriter writer, LPARAM writerPar);
};
struct AssetsFileHeader
{
	DWORD metadataSize;				//0x00
	DWORD fileSize;					//0x04 //big-endian
	DWORD format;					//0x08
	DWORD offs_firstFile;			//0x0C //big-endian
	BYTE unknown[4];				//0x10
	char unityVersion[25];			//0x14

	ASSETSTOOLS_API unsigned int GetSizeBytes();
	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar);
	ASSETSTOOLS_API QWORD Write(QWORD pos, AssetsFileWriter writer, LPARAM writerPar);

#define offs_AssetsFileHeader_metadata 0x13 //the metadata size count starts here
};
struct AssetsFileDependency
{
	struct GUID128
	{
		__int64 mostSignificant; //64-127 //big-endian
		__int64 leastSignificant; //0-63  //big-endian
		ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD Write(QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar);
	} guid;
	int type;
	char filePath[256]; //for buffered (type=1)
	char assetPath[256]; //path to the .assets file
	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar);
	ASSETSTOOLS_API QWORD Write(QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar);
};
struct AssetsFileDependencyList
{
	DWORD dependencyCount;
	struct AssetsFileDependency *pDependencies;
	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD format);
	ASSETSTOOLS_API QWORD Write(QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar, DWORD format);
};



struct TypeField_0D
{
	WORD unknown1;			//0x00 //most often 1; the Base field not that often;
	BYTE depth;				//0x02 //specifies the amount of parents
	bool isArray;			//0x03
	DWORD typeStringOffset;	//0x04
	DWORD nameStringOffset;	//0x08
	DWORD size;				//0x0C //size in bytes; if not static (if it contains an array), set to -1
	DWORD index;			//0x10
	DWORD flags;			//0x14
	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar);
	ASSETSTOOLS_API QWORD Write(QWORD curFilePos, AssetsFileWriter reader, LPARAM writerPar);
	ASSETSTOOLS_API const char *GetTypeString(const char *stringTable, size_t stringTableLen);
	ASSETSTOOLS_API const char *GetNameString(const char *stringTable, size_t stringTableLen);
};//0x18

struct Type_0D
{
	int classId; //0x00

	DWORD unknown1; //if classId < 0 //0x04
	DWORD unknown2; //if classId < 0 //0x08
	DWORD unknown3; //if classId < 0 //0x0C
	DWORD unknown4; //if classId < 0 //0x10
	
	DWORD unknown5; //0x04 or 0x14
	DWORD unknown6; //0x08 or 0x18
	DWORD unknown7; //0x0C or 0x1C
	DWORD unknown8; //0x10 or 0x20

	DWORD typeFieldsExCount; //if (TypeTree.enabled) //0x14 or 0x24
	TypeField_0D *pTypeFieldsEx;

	DWORD stringTableLen; //if (TypeTree.enabled) //0x18 or 0x28
	char *pStringTable;

	ASSETSTOOLS_API QWORD Read(bool hasTypeTree, QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD version);
	ASSETSTOOLS_API QWORD Write(bool hasTypeTree, QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar);
};

struct TypeField_07
{
	char type[256];
	char name[256];
	DWORD size;
	DWORD index;
	DWORD arrayFlag;
	DWORD flags1;
	DWORD flags2;
	DWORD childrenCount;
	TypeField_07 *children;

	ASSETSTOOLS_API QWORD Read(bool hasTypeTree, QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD version);
	ASSETSTOOLS_API QWORD Write(bool hasTypeTree, QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar);
};
struct Type_07
{
	int classId;
	TypeField_07 base;

	ASSETSTOOLS_API QWORD Read(bool hasTypeTree, QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD version);
	ASSETSTOOLS_API QWORD Write(bool hasTypeTree, QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar);
};
struct TypeTree
{
	bool hasTypeTree;
	DWORD version;
	DWORD fieldCount;

	union
	{
		Type_0D *pTypes_Unity5;
		Type_07 *pTypes_Unity4;
	};

	DWORD dwUnknown;
	DWORD _fmt;

	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD version); //Minimum AssetsFile format : 7
	ASSETSTOOLS_API QWORD Write(QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar, DWORD version);

	ASSETSTOOLS_API void Clear();
};

struct AssetPPtr
{
	DWORD fileID;
	QWORD pathID;
};
struct PreloadList
{
	DWORD len;
	AssetPPtr *items;
	
	ASSETSTOOLS_API QWORD Read(QWORD absFilePos, AssetsFileReader reader, LPARAM readerPar, DWORD format);
	ASSETSTOOLS_API QWORD Write(QWORD absFilePos, AssetsFileWriter writer, LPARAM writerPar, DWORD format);
};

class AssetsFile
{
	public:
		AssetsFileHeader header;
		TypeTree typeTree;
		
		PreloadList preloadTable;
		AssetsFileDependencyList dependencies;

		DWORD AssetTablePos;
		DWORD AssetCount;

		AssetsFileReader reader;
		LPARAM readerPar;

		ASSETSTOOLS_API AssetsFile(AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API ~AssetsFile();

		ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos, std::vector<AssetsReplacer*>& replacers, DWORD fileID);

		ASSETSTOOLS_API bool GetAssetFile(QWORD fileInfoOffset, AssetsFileReader reader, AssetFile *pBuf, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetAssetFileOffs(QWORD fileInfoOffset, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API bool GetAssetFileByIndex(QWORD fileIndex, AssetFile *pBuf, unsigned int *pSize, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetAssetFileOffsByIndex(QWORD fileIndex, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API bool GetAssetFileByName(const char *name, AssetFile *pBuf, unsigned int *pSize, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetAssetFileOffsByName(const char *name, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetAssetFileInfoOffs(QWORD fileIndex, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetAssetFileInfoOffsByName(const char *name, AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API QWORD GetFileList(AssetsFileReader reader, LPARAM readerPar);
		ASSETSTOOLS_API bool VerifyAssetsFile(AssetsFileVerifyLogger logger = NULL);
};
#endif