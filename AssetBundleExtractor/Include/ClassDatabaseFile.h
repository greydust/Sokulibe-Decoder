#pragma once
#include "AssetsFileFormat.h"
#include "defines.h"
#include <vector>

//custom file type to store Unity type information
#define ClassDatabaseFileVersion 2
#define ClassDatabaseCompressionType 1 //LZ4 compress by default
#define ClassDatabasePackageVersion 0

class ClassDatabaseFile;
struct ClassDatabaseFileString
{
	union {
		DWORD stringTableOffset;
		const char *string;
	} str;
	bool fromStringTable;
	ASSETSTOOLS_API const char *GetString(ClassDatabaseFile *pFile);
	ASSETSTOOLS_API QWORD Read(AssetsFileReader reader, LPARAM readerPar, QWORD filePos);
	ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos);
};
struct ClassDatabaseTypeField
{
	ClassDatabaseFileString typeName;
	ClassDatabaseFileString fieldName;
	BYTE depth;
	BYTE isArray;
	DWORD size;
	//DWORD index;
	DWORD flags2;
	
	ASSETSTOOLS_API ClassDatabaseTypeField();
	ASSETSTOOLS_API ClassDatabaseTypeField(const ClassDatabaseTypeField& other);
	ASSETSTOOLS_API QWORD Read(AssetsFileReader reader, LPARAM readerPar, QWORD filePos, int version);
	ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos);
};
class ClassDatabaseType
{
public:
	int classId;
	int baseClass;
	ClassDatabaseFileString name;

	std::vector<ClassDatabaseTypeField> fields;
	//DWORD fieldCount;
	//ClassDatabaseTypeField *fields;
	ASSETSTOOLS_API ClassDatabaseType();
	ASSETSTOOLS_API ClassDatabaseType(const ClassDatabaseType& other);
	ASSETSTOOLS_API ~ClassDatabaseType();
	ASSETSTOOLS_API QWORD Read(AssetsFileReader reader, LPARAM readerPar, QWORD filePos, int version);
	ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos);
};
struct ClassDatabaseFileHeader
{
	char header[4];
	BYTE fileVersion;

	BYTE compressionType; //version 2; 0 = none, 1 = LZ4
	DWORD compressedSize, uncompressedSize;  //version 2
	//BYTE assetsVersionCount; //version 0 only
	//BYTE *assetsVersions; //version 0 only

	BYTE unityVersionCount;
	char **pUnityVersions;


	DWORD stringTableLen;
	DWORD stringTablePos;
	ASSETSTOOLS_API QWORD Read(AssetsFileReader reader, LPARAM readerPar, QWORD filePos);
	ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos);
	//DWORD _tmp; //used only if assetsVersions == NULL; version 0 only
};
//all classes that override Component : prepend PPtr<GameObject> m_GameObject
//Transform : add vector m_Children {Array Array {int size; PPtr<Transform> data}}
class ClassDatabaseFile
{
	bool valid;
public:
	//Only for internal use, otherwise this could create a memory leak!
	bool dontFreeStringTable;
	ClassDatabaseFileHeader header;

	std::vector<ClassDatabaseType> classes;
	//DWORD classCount;
	//ClassDatabaseType *classes;

	char *stringTable;

public:

	ASSETSTOOLS_API bool Read(AssetsFileReader reader, LPARAM readerPar);
	ASSETSTOOLS_API QWORD Write(AssetsFileWriter writer, LPARAM writerPar, QWORD filePos, bool optimizeStringTable=true, DWORD compress=1, bool writeStringTable=true);
	ASSETSTOOLS_API bool IsValid();
	
	ASSETSTOOLS_API ClassDatabaseFile();
	ASSETSTOOLS_API ClassDatabaseFile(const ClassDatabaseFile& other);
	ASSETSTOOLS_API ~ClassDatabaseFile();
};
typedef ClassDatabaseFile* PClassDatabaseFile;