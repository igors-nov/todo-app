import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SimpleTreeItemWrapper, SortableTree } from 'dnd-kit-sortable-tree';
import SubTaskModal from '../components/SubTaskModal';
import DeleteModal from '../components/DeleteModal';
import listService from '../services/list.service';
import todoService from '../services/todo.service';
import { toast, ToastContainer } from 'react-toastify';
import PasswordModal from '../components/PasswordModal';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import DescriptionModal from '../components/DescriptionModal';
import TreeTask from '../components/TreeTask';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TodoList = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      auth: { accessToken },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  const navigate = useNavigate();
  const { uniqueUrl } = useParams();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingDescriptionId, setEditingDescriptionId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [list, setList] = useState(null);
  const [addSubtaskModal, setAddSubtaskModal] = useState(null);
  const [deleteTaskModal, setDeleteTaskModal] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteListModal, setDeleteListModal] = useState(false);

  useEffect(() => {
    if (uniqueUrl) {
      listService
        .findOne(uniqueUrl, accessToken)
        .then(data => {
          setList(data);
        })
        .catch(e => {
          try {
            const parsed = JSON.parse(e.message);
            if (parsed.statusCode === 401) {
              setPasswordModal(true);
              return;
            }
            throw new Error('not found');
          } catch {
            toast.error('List not found', { toastId: 'error-list' });
          }
        });
    }
  }, [uniqueUrl, accessToken]);

  useEffect(() => {
    if (list?.id) {
      todoService
        .findByList(list.id, accessToken)
        .then(data => setTodos(data))
        .catch(() => {
          toast.error('Todo tasks loading error', { toastId: 'error-todo' });
        });
    }
  }, [list, accessToken]);

  useEffect(() => {
    if (!list?.id) return;

    socket.on(`list:${list.id}:todoCreated`, todo => {
      setTodos(prev => [...prev, todo]);
    });

    socket.on(`list:${list.id}:subtaskCreated`, ({ parentId, subtask }) => {
      setTodos(prev => {
        const updateTodos = todos =>
          todos.map(t => (t.id === parentId ? { ...t, children: [...(t.children || []), subtask] } : { ...t, children: updateTodos(t.children || []) }));
        return updateTodos(prev);
      });
    });

    socket.on(`list:${list.id}:todoUpdated`, updatedTodo => {
      setTodos(prev => {
        const updateTodos = todos =>
          todos.map(t => (t.id === updatedTodo.id ? { ...t, ...updatedTodo, children: t.children } : { ...t, children: updateTodos(t.children || []) }));
        return updateTodos(prev);
      });
    });

    socket.on(`list:${list.id}:todoDeleted`, id => {
      const removeTodo = todos => todos.filter(t => t.id !== id).map(t => ({ ...t, children: removeTodo(t.children || []) }));
      setTodos(prev => removeTodo(prev));
    });

    socket.on(`list:${list.id}:todoReordered`, newTodos => {
      setTodos(newTodos);
    });

    socket.on(`list:${list.id}:freezeToggle`, newList => {
      setList(newList);
    });

    return () => {
      socket.off(`list:${list.id}:todoCreated`);
      socket.off(`list:${list.id}:subtaskCreated`);
      socket.off(`list:${list.id}:todoUpdated`);
      socket.off(`list:${list.id}:todoDeleted`);
      socket.off(`list:${list.id}:todoReordered`);
      socket.off(`list:${list.id}:freezeToggle`);
    };
  }, [list]);

  const findParentTask = (items, parentId) => {
    let foundResult;

    items.forEach(item => {
      if (item.id === parentId) {
        foundResult = item.children;
        return;
      }

      if (item.children?.length > 0) {
        foundResult = findParentTask(item.children, parentId);
      }
    });

    return foundResult || [];
  };

  const handleDragEnd = (items, reason) => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able to sort', { toastId: 'password-sort-error' });
      return;
    }

    if (list.frozen) {
      toast.error('List is frozen, unfreeze it or ask list owner to unfreeze to edit', { toastId: 'frozen-sort-error' });
      return;
    }

    items = reason.droppedToParent ? findParentTask(items, reason.droppedToParent.id) : items;

    socket.emit('orderTodo', { listId: list?.id, items, newParent: reason.droppedToParent ? reason.droppedToParent.id : null });
  };

  const handleCreateTodo = (parentId = undefined) => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able create new tasks', { toastId: 'password-task-error' });
      return;
    }

    if (!newTodo || newTodo.length === 0) {
      toast.error('Task title can not be empty');
      return;
    }

    socket.emit('createTodo', { title: newTodo, listId: list?.id, parentId });
    setNewTodo('');
  };

  const handleUpdateTodo = (id, completed) => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able update tasks', { toastId: 'password-update-task-error' });
      return;
    }

    socket.emit('updateTodo', { id, completed: !completed, listId: list?.id });
  };

  const handleDeleteTodo = id => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able delete tasks', { toastId: 'password-delete-task-error' });
      return;
    }

    socket.emit('deleteTodo', { id, listId: list?.id });
  };

  const handleEditDescription = (id, description) => {
    if ((list.protection !== 1 && !accessToken) || list.frozen) {
      return;
    }

    setEditingDescriptionId(id);
    setTempDescription(description);
  };

  const handleSaveDescription = id => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able update tasks', { toastId: 'password-update-task-error' });
      return;
    }

    socket.emit('updateTodo', { id, listId: list?.id, description: tempDescription });
    setEditingDescriptionId(null);
  };

  const handlePasswordCheck = () => {
    listService
      .login(uniqueUrl, password)
      .then(data => {
        console.log(data);
        if (data.access_token) {
          toast.success('Successfully logged in');
          setAccessToken(data.access_token);
          setPasswordModal(false);
          return;
        }

        toast.error('Wrong password provided', { toastId: 'wrong-password' });
        setPassword('');
      })
      .catch(() => {
        toast.error('Wrong password provided', { toastId: 'wrong-password' });
        setPassword('');
      });
  };

  const handleDeleteList = () => {
    listService
      .deleteList(uniqueUrl, accessToken)
      .then(res => {
        if (res.ok) {
          toast.success('Deleted successfully');
          return navigate('/');
        }

        throw new Error();
      })
      .catch(() => {
        toast.error('Uncaught exception occured, please try again');
      });
  };

  const handleFreezeList = () => {
    if (!accessToken && list.protection !== 1) {
      toast.error('Please enter password before you will be able freeze list', { toastId: 'password-freeze-error' });
      return;
    }

    socket.emit('toggleFreezeList', { listId: list?.id });
  };

  const treeItem = React.forwardRef((props, ref) => {
    // eslint-disable-next-line react/prop-types
    const todo = props?.item;

    return (
      <SimpleTreeItemWrapper manualDrag={true} disableCollapseOnItemClick={true} hideCollapseButton={true} {...props} ref={ref}>
        <TreeTask
          list={list}
          todo={todo}
          passwordAccepted={accessToken}
          handleUpdateTodo={handleUpdateTodo}
          setAddSubtaskModal={setAddSubtaskModal}
          setDeleteTaskModal={setDeleteTaskModal}
          handleEditDescription={handleEditDescription}
        />
      </SimpleTreeItemWrapper>
    );
  });
  treeItem.displayName = 'TreeItem';

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {list?.id && (
        <>
          <h1 className="text-3xl font-bold mb-6">{list.name}</h1>
          <div className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              {!accessToken && (
                <>
                  <button onClick={() => setPasswordModal(true)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-300">
                    Login With Password
                  </button>

                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <InformationCircleIcon className="size-4 text-gray-600" />
                    {list.protection === 1 && <p>Password is requred for list deletion and freezing</p>}
                    {list.protection === 2 && <p>Password is requred for list editing</p>}
                  </div>
                </>
              )}
              {accessToken && (
                <>
                  <button onClick={() => setDeleteListModal(true)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
                    Delete List
                  </button>
                  <button
                    onClick={() => handleFreezeList()}
                    className={`ml-4 px-4 py-2 text-white rounded ${list.frozen ? 'bg-gray-600 hover:bg-gray-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                  >
                    {list.frozen ? 'Unfreeze' : 'Freeze'} List
                  </button>
                </>
              )}
            </div>

            {(list.protection === 1 || accessToken) && !list.frozen && (
              <>
                <div className="mb-4">
                  <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="New task" className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                  <button onClick={() => handleCreateTodo()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                    Add Todo
                  </button>
                </div>
              </>
            )}
            <SortableTree items={todos} onItemsChanged={(items, reason) => handleDragEnd(items, reason)} TreeItemComponent={treeItem} />
          </div>
        </>
      )}

      <DescriptionModal
        show={editingDescriptionId ? true : false}
        onClose={() => {
          setEditingDescriptionId(null);
          setTempDescription('');
        }}
        callback={() => {
          handleSaveDescription(editingDescriptionId);
          setEditingDescriptionId(null);
        }}
        save={true}
        description={tempDescription}
        setDescription={setTempDescription}
      />

      <SubTaskModal
        show={addSubtaskModal ? true : false}
        onClose={() => {
          setAddSubtaskModal(null);
          setNewTodo('');
        }}
        callback={() => {
          handleCreateTodo(addSubtaskModal);
          setAddSubtaskModal(null);
        }}
        save={true}
        description={newTodo}
        setDescription={setNewTodo}
      />

      <DeleteModal
        show={deleteTaskModal ? true : false}
        onClose={() => setDeleteTaskModal(null)}
        delete={true}
        callback={() => {
          handleDeleteTodo(deleteTaskModal);
          setDeleteTaskModal(null);
        }}
      />

      <PasswordModal
        show={passwordModal}
        onClose={() => {
          setPasswordModal(false);
        }}
        callback={() => {
          handlePasswordCheck();
        }}
        save={true}
        password={password}
        setPassword={setPassword}
      />

      <DeleteModal
        show={deleteListModal ? true : false}
        onClose={() => setDeleteListModal(null)}
        delete={true}
        overrideText="Are you sure you want to delete whole list? It cannot be reverted."
        callback={() => {
          handleDeleteList();
          setDeleteListModal(null);
        }}
      />

      <ToastContainer />
    </div>
  );
};

export default TodoList;
