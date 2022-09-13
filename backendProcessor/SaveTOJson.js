import fs from "fs";
let express_label ="{\n" +
    "  \"det_business_code\": \"C001_01_01\",\n" +
    "  \"det_package_name\": \"摄影作品\",\n" +
    "  \"det_package_num\": \"1\",\n" +
    "  \"det_time\": \"2020-07-20\",\n" +
    "  \"from_space_address\": \"\",\n" +
    "  \"from_space_device\": \"\",\n" +
    "  \"from_space_ip\": \"\",\n" +
    "  \"from_space_user\": \"c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e\",\n" +
    "  \"package_list\": [\n" +
    "    {\n" +
    "      \"file_list\": [\n" +
    "        {\n" +
    "          \"file_hash\": \"7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72\",\n" +
    "          \"file_name\": \"ImageSelector_20190107_193327.JPEG\",\n" +
    "          \"file_path\": \"/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG\",\n" +
    "          \"file_size\": \"2635924\",\n" +
    "          \"is_split\": \"0\",\n" +
    "          \"split_num\": \"0\"\n" +
    "        },\n" +
    "        {\n" +
    "          \"file_hash\": \"bcf539c8d1b98b5a6bf8fb8f09419d868bf1e9997535e736a57997da457c5047\",\n" +
    "          \"file_name\": \"ImageSelector_20190107_191612.JPEG\",\n" +
    "          \"file_path\": \"/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_191612.JPEG\",\n" +
    "          \"file_size\": \"2317117\",\n" +
    "          \"is_split\": \"0\",\n" +
    "          \"split_num\": \"0\"\n" +
    "        }\n" +
    "      ],\n" +
    "      \"package_hash\": \"2ebfa0761d9ec58db5b6184ee4a55bc5c32a5dfb6df6ccae6e321e43d9f965e5\",\n" +
    "      \"package_name\": \"摄影作品\",\n" +
    "      \"package_token\": \"d8babcaeb95e889e9fd6647cb51a14c3536e993f0de7a8dac35ae2ed157448cc\"\n" +
    "    }\n" +
    "  ],\n" +
    "  \"to_space_address\": \"\",\n" +
    "  \"to_space_user\": \"\"\n" +
    "}";
let express_json ={
    "det_business_code": "C001_01_01",
    "det_package_name": "摄影作品",
    "det_package_num": "1",
    "det_time": "2020-07-20",
    "from_space_address": "",
    "from_space_device": "",
    "from_space_ip": "",
    "from_space_user": "c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e",
    "package_list": [
        {
            "file_list": [
                {
                    "file_hash": "7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72",
                    "file_name": "ImageSelector_20190107_193327.JPEG",
                    "file_path": "/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG",
                    "file_size": "2635924",
                    "is_split": "0",
                    "split_num": "0"
                },
                {
                    "file_hash": "bcf539c8d1b98b5a6bf8fb8f09419d868bf1e9997535e736a57997da457c5047",
                    "file_name": "ImageSelector_20190107_191612.JPEG",
                    "file_path": "/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_191612.JPEG",
                    "file_size": "2317117",
                    "is_split": "0",
                    "split_num": "0"
                }
            ],
            "package_hash": "2ebfa0761d9ec58db5b6184ee4a55bc5c32a5dfb6df6ccae6e321e43d9f965e5",
            "package_name": "摄影作品",
            "package_token": "d8babcaeb95e889e9fd6647cb51a14c3536e993f0de7a8dac35ae2ed157448cc"
        }
    ],
    "to_space_address": "",
    "to_space_user": ""
};
let pakage_label = "{\n" +
    "    \"cover\": \"/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG\",\n" +
    "    \"cover_hash\": \"7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72\",\n" +
    "    \"name\": \"摄影作品\",\n" +
    "    \"subject\": [\n" +
    "        {\n" +
    "            \"name\": \"张三\",\n" +
    "            \"type\": \"1\",\n" +
    "            \"usn\": \"c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e\"\n" +
    "        }\n" +
    "    ],\n" +
    "    \"object\": [\n" +
    "        {\n" +
    "            \"is_split\": \"0\",\n" +
    "            \"split_num\": \"0\",\n" +
    "            \"works_hash\": \"7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72\",\n" +
    "            \"works_name\": \"ImageSelector_20190107_193327.JPEG\",\n" +
    "            \"works_path\": \"/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG\",\n" +
    "            \"works_size\": \"2635924\",\n" +
    "            \"works_type\": \"10\"\n" +
    "        },\n" +
    "        {\n" +
    "            \"is_split\": \"0\",\n" +
    "            \"split_num\": \"0\",\n" +
    "            \"works_hash\": \"bcf539c8d1b98b5a6bf8fb8f09419d868bf1e9997535e736a57997da457c5047\",\n" +
    "            \"works_name\": \"ImageSelector_20190107_191612.JPEG\",\n" +
    "            \"works_path\": \"/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_191612.JPEG\",\n" +
    "            \"works_size\": \"2317117\",\n" +
    "            \"works_type\": \"10\"\n" +
    "        }\n" +
    "    ],\n" +
    "    \"copyright_rights_get\": \"0\",\n" +
    "    \"params\": {\n" +
    "        \"batch_name\": \"摄影作品\",\n" +
    "        \"det_business_code\": \"C001_01_01\",\n" +
    "        \"package_token\": \"d8babcaeb95e889e9fd6647cb51a14c3536e993f0de7a8dac35ae2ed157448cc\",\n" +
    "        \"step\": \"1\",\n" +
    "        \"submit_usn\": \"c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e\",\n" +
    "        \"works_count\": \"2\"\n" +
    "    }\n" +
    "}"
let pakage_json ={
    "cover": "/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG",
    "cover_hash": "7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72",
    "name": "摄影作品",
    "subject": [
        {
            "name": "张三",
            "type": "1",
            "usn": "c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e"
        }
    ],
    "object": [
        {
            "is_split": "0",
            "split_num": "0",
            "works_hash": "7e5eb2f05a85273425ab0a2eff14aa86c52dbe9d8256438b8737ea6c52452a72",
            "works_name": "ImageSelector_20190107_193327.JPEG",
            "works_path": "/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_193327.JPEG",
            "works_size": "2635924",
            "works_type": "10"
        },
        {
            "is_split": "0",
            "split_num": "0",
            "works_hash": "bcf539c8d1b98b5a6bf8fb8f09419d868bf1e9997535e736a57997da457c5047",
            "works_name": "ImageSelector_20190107_191612.JPEG",
            "works_path": "/storage/emulated/0/ImageSelector/CameraImage/ImageSelector_20190107_191612.JPEG",
            "works_size": "2317117",
            "works_type": ""
        }
    ],
    "copyright_rights_get": "0",
    "params": {
        "batch_name": "摄影作品",
        "det_business_code": "C001_01_01",
        "package_token": "d8babcaeb95e889e9fd6647cb51a14c3536e993f0de7a8dac35ae2ed157448cc",
        "step": "1",
        "submit_usn": "c9ef0543c0b7d5853771883d39e2dc11802f8c9a2cf0c7b4eb7df9c0ebcc307e",
        "works_count": "2"
    }
};
const express_file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObject\\express_file.json');
let data = express_label;
fs.open(express_file, 'w', (err, fd) => {
    if (err) throw err;
    fs.appendFile(fd, data, 'utf8', (err) => {
        if (err) throw err;
    });
    fs.close(fd, (err) => {
        if (err) throw err;
    });
});
const pakage_file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObject\\pakage_file.json');
data = pakage_label;

fs.open(pakage_file, 'w', (err, fd) => {
    if (err) throw err;
    fs.appendFile(fd, data, 'utf8', (err) => {
        if (err) throw err;
    });
    fs.close(fd, (err) => {
        if (err) throw err;
    });
});