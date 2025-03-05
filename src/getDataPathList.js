import fs from 'fs'
import path from 'path'

const targetDir = './public'
const outputFile = './src/model.json'

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  console.log(files.length)
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // 递归处理子目录
      fileList = getFiles(filePath, fileList);
    } else {
      if (/.glb$|\.gltf$/.test(filePath)) {
        // 只收集文件路径
        let url = filePath.replace(/\\/g, '/')
        url = url.replace(/^public/, '')
        fileList.push(url);
        
      }
    }
  });
  return fileList;
}

const allFiles = getFiles(targetDir);

// 检查输出文件是否存在，不存在则创建
if (!fs.existsSync(outputFile)) {
  fs.writeFileSync(outputFile, '');
}
// 将文件路径写入输出文件
fs.writeFileSync(outputFile, JSON.stringify(allFiles));
