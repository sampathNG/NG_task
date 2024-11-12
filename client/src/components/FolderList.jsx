import { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleDown } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function FolderList() {
  const [folders, setFolders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [visibleFolderId, setVisibleFolderId] = useState(null);
  const [visibleFileId, setVisibleFileId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const notifyFolderNameEmpty = () => toast("Folder name cannot be empty");
  useEffect(() => {
    axios
      .get("http://localhost:5000/folders")
      .then((response) => setFolders(response.data))
      .catch((error) => console.error(error));
  }, []);
  const handleExpand = (folderId) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [folderId]: !prevExpanded[folderId],
    }));
    if (!expanded[folderId]) {
      getAllFiles(folderId);
    }
  };
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSelectedFolderId(event.target.dataset.folderId);
  };
  const handleUploadFile = (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedFolderId) {
      toast.error("Please select a file and a folder.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    axios
      .post(`http://localhost:5000/folders/${selectedFolderId}/files`, formData)
      .then((response) => {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder._id === selectedFolderId
              ? { ...folder, files: [...folder.files, response.data] }
              : folder
          )
        );
        setSelectedFile(null);
      })
      .catch((error) => console.error(error));
  };
  const handleCreateFolder = (event) => {
    event.preventDefault();
    if (!newFolderName.trim()) {
      notifyFolderNameEmpty();
      return;
    }
    axios
      .post("http://localhost:5000/folders", { name: newFolderName })
      .then((response) => {
        setFolders([...folders, response.data]);
        setNewFolderName("");
      })
      .catch((error) => console.error(error));
  };
  const handleDeleteFile = (fileId, folderId) => {
    axios
      .delete(`http://localhost:5000/files/${fileId}`)
      .then(() => {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder._id === folderId
              ? {
                  ...folder,
                  files: folder.files.filter((file) => file._id !== fileId),
                }
              : folder
          )
        );
      })
      .catch((error) => console.error("Failed to delete file:", error));
  };
  const handleDeleteFolder = (folderId) => {
    axios
      .delete(`http://localhost:5000/folders/${folderId}`)
      .then(() => {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder._id !== folderId)
        );
      })
      .catch((error) => console.error(error));
  };
  const getAllFiles = (folderId) => {
    axios
      .get(`http://localhost:5000/folders/${folderId}/files`)
      .then((response) => {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder._id === folderId
              ? { ...folder, files: response.data }
              : folder
          )
        );
      })
      .catch((error) => console.error(error));
  };
  const handleRenameFile = (fileId) => {
    const newName = prompt("Enter the new file name:");
    if (newName) {
      axios
        .patch(`http://localhost:5000/files/${fileId}`, { name: newName })
        .then(() => {
          setFolders((prevFolders) =>
            prevFolders.map((folder) => ({
              ...folder,
              files: folder.files.map((file) =>
                file._id === fileId ? { ...file, name: newName } : file
              ),
            }))
          );
        })
        .catch((error) => console.error("Failed to rename file:", error));
    }
  };
  const handleRenameFolder = (folderId) => {
    const newName = prompt("Enter the new folder name:");
    if (newName) {
      axios
        .patch(`http://localhost:5000/folders/${folderId}`, { name: newName })
        .then(() => {
          setFolders((prevFolders) =>
            prevFolders.map((folder) =>
              folder._id === folderId ? { ...folder, name: newName } : folder
            )
          );
        })
        .catch((error) => console.error("Failed to rename folder:", error));
    }
  };
  const toggleFolderVisibility = (folderId) => {
    setVisibleFolderId((prev) => (prev === folderId ? null : folderId));
  };
  const toggleFileVisibility = (fileId) => {
    setVisibleFileId((prev) => (prev === fileId ? null : fileId));
  };
  return (
    <div className="flex flex-col justify-center items-center mx-auto p-4">
      <h1 className="text-center text-2xl font-semibold py-10">
        File Manager Task
      </h1>
      <form onSubmit={handleCreateFolder} className="p-4 space-x-4">
        <input
          type="text"
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
          placeholder="Enter new folder name"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Folder
        </button>
        <ToastContainer />
      </form>
      <ul className="list-none space-y-2">
        {folders.map((folder) => (
          <li key={folder._id} className="border-b">
            <div className="flex items-center space-x-2 relative">
              <span
                className="font-semibold text-lg p-2 border-2 border-yellow-500 bg-blue-400 cursor-pointer"
                onClick={() => toggleFolderVisibility(folder._id)}
              >
                {folder.name}
              </span>
              {visibleFolderId === folder._id && (
                <div className="flex space-x-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    data-folder-id={folder._id}
                  />
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={handleUploadFile}
                  >
                    Upload File
                  </button>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handleRenameFolder(folder._id)}
                  >
                    Edit Folder Name
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder._id);
                    }}
                  >
                    Delete Folder
                  </button>
                </div>
              )}
              <FaAngleDown
                onClick={() => handleExpand(folder._id)}
                className="cursor-pointer"
              />
            </div>
            {expanded[folder._id] && folder.files && (
              <ul className="ml-6 space-y-2 mt-2">
                {folder.files.map((file) => (
                  <li key={file._id} className="flex items-center">
                    <span
                      onClick={() => toggleFileVisibility(file._id)}
                      className="cursor-pointer"
                    >
                      {file.name}
                    </span>
                    {visibleFileId === file._id && (
                      <div className="flex space-x-4 ml-4">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => handleRenameFile(file._id)}
                        >
                          Edit File Name
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDeleteFile(file._id, folder._id)}
                        >
                          Delete File
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default FolderList;
