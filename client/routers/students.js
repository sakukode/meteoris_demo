/* Students */
Router.route('students', function() {
    Router.go('studentsIndex');
});
Router.route('students/index/:limit?/', {
    name: 'studentsIndex',
    controller: StudentsController,
    action: 'index',
});
Router.route('students/insert/', {
    name: 'studentsInsert',
    controller: StudentsController,
    action: 'insert',
});
Router.route('students/update/:_id?', {
    name: 'studentsUpdate',
    controller: StudentsController,
    action: 'update',
});
Router.route('students/view/:_id?', {
    name: 'studentsView',
    controller: StudentsController,
    action: 'view',
});
/* EOF Students */