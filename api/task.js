const moment = require('moment')


module.exports = app => {
    //By using method GET it will search for the tasks until that day
    const getTasks = (req, res) => {
        //Getting the date , if date was not received use the today date.
        const date = req.query.date ? req.query.date
            : moment().endOf('day').toDate()

            
        app.db('tasks')
            .where({ userId: req.user.id }) // apply userID from dateBase
            .where('estimateAt', '<=', date)  //Take all estimateAt that is less or equal to the date
            .orderBy('estimateAt') 
            .then(tasks => res.json(tasks)) //convert all tasks to a Json 
            .catch(err => res.status(500).json(err)) // if there's some erro show it!
    }

    //By using method POST it will be saving a new task    
    const save = (req, res) => {
        if (!req.body.desc.trim()) {
            return res.status(400).send('You must fill the description!') //if the description cames null or only white spaces.
        }

        req.body.userId = req.user.id //apply the userID from the app to userID on dateBase

        app.db('tasks')
            .insert(req.body) //How every form that came from frontend have the same name of our backend and dateBase, we can get everything just using .body
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }
    //By using a method DELETE it will be deleting a task with sent ID    
    const remove = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id }) //check if the user that is deleting is the same that made the task
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send() //checking if there are more than one row deleted.
                } else {
                    const msg = `Task not found with ID: ${req.params.id}.` //Error that wasn't found the task with that ID.
                    res.status(400).send(msg)
                }
            })
            .catch(err => status(400).json(err))
    }

    const updateTaskDoneAt = (req, res, doneAt) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })  //checking if the user that update the task is the same from the request.
            .update({ doneAt })
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const toggleTask = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(task => {
                if (!task) {
                    const msg = `Task ID ${req.params.id} not found!`
                    return res.status(400).send(msg)
                }

                const doneAt = task.doneAt ? null : new Date()
                updateTaskDoneAt(req, res, doneAt)
            })
            .catch(err => res.status(400).json(err))
    }

    return { getTasks, save, remove, toggleTask }
}