using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JsonDecrypter
{
    public class MyConverter : Newtonsoft.Json.JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return (objectType.IsGenericType && objectType.GetGenericTypeDefinition() == typeof(List<>));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteRawValue(JsonConvert.SerializeObject(value, Formatting.None));
        }
    }

    class Program
    {
        private static string errorMessage = "";
        public static void JsonErrorHandler(object sender, Newtonsoft.Json.Serialization.ErrorEventArgs args)
        {
            args.ErrorContext.Handled = true;
            errorMessage += args.ErrorContext.Error.Message + '\n';
        }

        private static string DecryptKey(string val)
        {
            StringBuilder stringBuilder = new StringBuilder();
            int num;
            if (val.Length % 2 == 0)
            {
                num = val.Length;
            }
            else
            {
                num = val.Length - 1;
            }
            for (int i = 0; i < val.Length; i++)
            {
                if (i % 2 == 0)
                {
                    stringBuilder.Append(val[i]);
                }
                else
                {
                    stringBuilder.Append(val[num]);
                }
                num--;
            }
            return stringBuilder.ToString();
        }

        private static string Decrypt(string key, string salt, string data)
        {
            System.Security.Cryptography.ICryptoTransform transform = new System.Security.Cryptography.RijndaelManaged
            {
                BlockSize = 128,
                KeySize = 128,
                Padding = System.Security.Cryptography.PaddingMode.Zeros,
                Mode = System.Security.Cryptography.CipherMode.CBC,
                Key = Convert.FromBase64String(DecryptKey(key)),
                IV = Convert.FromBase64String(DecryptKey(salt))
            }.CreateDecryptor();
            byte[] array = System.Convert.FromBase64String(data);
            byte[] array2 = new byte[array.Length];
            MemoryStream stream = new MemoryStream(array);
            System.Security.Cryptography.CryptoStream cryptoStream = new System.Security.Cryptography.CryptoStream(stream, transform, System.Security.Cryptography.CryptoStreamMode.Read);
            cryptoStream.Read(array2, 0, array2.Length);
            return Encoding.UTF8.GetString(array2).TrimEnd(new char[1]);
        }

        static void Main(string[] args)
        {

            JsonSerializerSettings deserializeSetting = new JsonSerializerSettings()
            {
                MissingMemberHandling = MissingMemberHandling.Error,
            };
            deserializeSetting.Error += JsonErrorHandler;

            JsonSerializerSettings serializeSetting = new JsonSerializerSettings()
            {
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore,
            };
            serializeSetting.Converters.Add(new MyConverter());


            Directory.CreateDirectory("ConvertedData/");
            string[] files = Directory.GetFiles("RawData/", "*.json");

            Dictionary<string, object> firebaseObj = new Dictionary<string, object>();
            foreach (string file in files)
            {
                string rawData = File.ReadAllText(file);
                string convertedData = Decrypt("W=HAKVbtcVP6vTfzvZAGTm=6", "P=DgvzWGQMPDB7dxK4h1fB=D", rawData);
                object obj = JsonConvert.DeserializeObject(convertedData, deserializeSetting);

                string fileName = Path.GetFileNameWithoutExtension(file);
                if (fileName != "assetHash" && fileName != "movieVersion" && fileName != "soundVersion" && fileName != "unit_story")
                {
                    firebaseObj.Add(Path.GetFileNameWithoutExtension(file), obj);
                }

                string convertedString = JsonConvert.SerializeObject(obj, serializeSetting);
                File.WriteAllText("ConvertedData/" + Path.GetFileName(file), convertedString);
            }

            string firebaseString = JsonConvert.SerializeObject(firebaseObj, serializeSetting);
            File.WriteAllText("ConvertedData/firebase.json", firebaseString);
        }
    }
}
