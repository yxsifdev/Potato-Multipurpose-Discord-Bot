const fs = require("fs");
const path = require("path");

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith(".js")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function pluralize(word) {
  if (word.endsWith("s")) return word;
  return word + "s";
}

module.exports = (client) => {
  client.handleComponents = async () => {
    const componentsPath = "./src/components";
    const componentTypes = ["button", "selectMenu", "modal"];

    if (!fs.existsSync(componentsPath)) {
      console.warn(`Components directory not found at ${componentsPath}`);
      return;
    }

    for (const type of componentTypes) {
      const singularPath = path.join(componentsPath, type);
      const pluralPath = path.join(componentsPath, pluralize(type));

      let files = [];
      let usedPath = "";
      if (fs.existsSync(pluralPath)) {
        files = getFiles(pluralPath);
        usedPath = pluralPath;
      } else if (fs.existsSync(singularPath)) {
        files = getFiles(singularPath);
        usedPath = singularPath;
      } else {
        console.warn(
          `Directory for ${type} not found at ${singularPath} or ${pluralPath}`
        );
        continue;
      }

      const collectionName = pluralize(type);
      const componentCollection = client[collectionName];

      if (!componentCollection) {
        console.error(`Collection for ${collectionName} is not initialized`);
        continue;
      }

      for (const filePath of files) {
        try {
          const component = require(path.resolve(filePath));
          if (component.data && component.data.name) {
            componentCollection.set(component.data.name, component);
          } else {
            console.warn(
              `Component at ${filePath} is missing data or name property`
            );
          }
        } catch (error) {
          console.error(`Error loading component at ${filePath}:`, error);
        }
      }

      // console.log(
      //   `Loaded ${componentCollection.size} ${collectionName} from ${usedPath}`
      // );
    }
  };
};

// const { readdirSync } = require("fs");

// module.exports = (client) => {
//     client.handleComponents = async () => {
//         const componentFolders = readdirSync("./src/components/");
//         for (const folder of componentFolders) {
//             const componentFiles = readdirSync(`./src/components/${folder}`)
//                 .filter(file => file.endsWith(".js"));

//             const { buttons, selectMenus, modals } = client;

//             switch (folder) {
//                 case "buttons":
//                     for (const file of componentFiles) {
//                         const button = require(`../../components/${folder}/${file}`);
//                         buttons.set(button.data.name, button);
//                     }
//                     break;
//                 case "selectMenu":
//                     for (const file of componentFiles) {
//                         const menu = require(`../../components/${folder}/${file}`);
//                         selectMenus.set(menu.data.name, menu);
//                     }
//                     break;
//                 case "modals":
//                     for (const file of componentFiles) {
//                         const modal = require(`../../components/${folder}/${file}`);
//                         modals.set(modal.data.name, modal);
//                     }
//                     break;
//                 default:
//                     break;
//             }
//         }
//     };
// };
