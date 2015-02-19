UsersController = MeteorisController.extend({
    /* get subscribtion from server with parameter criteria, and sort/limit */
    subscriptions: function() {
        var sort = MeteorisGridView.getSorting();
        sort.limit = this.limit();

        this.subs.subscribe('mugenRoleGroups', {}, {sort: {name: 1}});
        this.subscription = this.subs.subscribe('users', this.getCriteria(), sort);
    },
    /* event searching data by user input with parameter */
    search: function(t) {
        Router.go(Router.current().route.getName(), {limit: this.limit()}, {query: "q=" + t.find('#search').value});
    },
    /* @override getCriteria */
    getCriteria: function() {
        var search = this.params.query.q ? this.params.query.q : "";
        return {
            $or: [
                {'profile.name': {$regex: search, $options: 'i'}},
                {'emails.address': {$regex: search, $options: 'i'}},
            ]
        };
    },
    login: function(t) {
        var email = t.find('#email').value;
        var password = t.find('#password').value;

        Meteor.loginWithPassword(email, password, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
            } else {
                MeteorisFlash.set('success', 'login success');
                Router.go('sitesIndex');
            }
        });
    },
    loginWithFacebook: function() {
        Meteor.loginWithFacebook({
            requestPermissions: ['publish_actions']
        }, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
            } else {
                MeteorisFlash.set('success', 'login success');
                Router.go('sitesIndex');
            }
        });
    },
    register: function(t) {
        var email = t.find('#email').value;
        var password = t.find('#password').value;
        var name = t.find('#name').value;
        var doc = {
            email: email,
            password: password,
            profile: {
                name: name,
                mugenRoleGroupId: "1",
                createdAt: new Date(TimeSync.serverTime()),
                updatedAt: new Date(TimeSync.serverTime()),
            }
        };

        Accounts.createUser(doc, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
                throw new Meteor.Error(err);
            } else {
                MeteorisFlash.set('success', 'register success');
                Router.go('sitesIndex');
            }
        });
    },
    /* private get user input docs */
    _getDoc: function(t) {
        var doc = {
            email: t.find('#email').value,
            password: t.find('#password').value,
            profile: {
                name: t.find('#name').value,
                createdAt: new Date(TimeSync.serverTime()),
                updatedAt: new Date(TimeSync.serverTime()),
            }
        };
        var mugenRoleGroupId = t.find('#mugenRoleGroupId').value ? t.find('#mugenRoleGroupId').value : null;
        if (mugenRoleGroupId)
            doc.profile.mugenRoleGroupId = mugenRoleGroupId;
        return doc;
    },
    index: function() {
        var sort = MeteorisGridView.getSorting();
        sort.limit = this.limit();
        var models = Meteor.users.find(this.getCriteria(), sort);

        return this.render('usersIndex', {
            data: {
                ready: this.subscription.ready,
                isEmpty: models.count() === 0 ? true : false,
                models: models,
                hasMore: this.limit() == models.fetch().length ? this.route.path({limit: this.limit() + this.increment}) : null,
            }
        });
    },
    view: function() {
        return this.render('usersView', {
            data: {
                model: this._loadModel(this.getId()),
            }
        });
    }, /* event inserting data */
    insert: function(t) {
        if (this._post) {
            //set inserted doc
            var doc = this._getDoc(t);

            Meteor.call('Users.insert', doc, function(err) {
                if (err) {
                    MeteorisFlash.set('danger', err.message);
                    throw new Meteor.Error(err);
                } else {
                    MeteorisFlash.set('success', 'Success Inserting Users');
                    Router.go('usersIndex');
                }
            });
        }
        return this.render('usersInsert', {});
    },
    /* event updating data */
    update: function(t) {
        var _id = this.getId();
        var model = this._loadModel(_id);

        if (this._post) {
            //set updated doc
            var doc = {
                'emails.0.address': t.find('#email').value,
                profile: {
                    name: t.find('#name').value,
                    updatedAt: new Date(TimeSync.serverTime()),
                }
            };
            var mugenRoleGroupId = t.find('#mugenRoleGroupId').value ? t.find('#mugenRoleGroupId').value : null;
            if (mugenRoleGroupId)
                doc.profile.mugenRoleGroupId = mugenRoleGroupId;

            Meteor.users.update(_id, {$set: doc}, function(err) {
                if (err) {
                    MeteorisFlash.set('danger', err.message);
                    throw new Meteor.Error(err);
                }
                MeteorisFlash.set('success', "Success Updating Users");
            });
            Router.go('usersIndex');
        }
        return this.render('usersUpdate', {
            data: {
                model: model,
            }
        });
    },
    /* event removing data by id */
    remove: function(_id) {
        Meteor.users.remove(_id, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
                throw new Meteor.Error(err);
            }
            MeteorisFlash.set('success', "Success Removing Users");
        });
    },
    profile: function() {
        return this.render('usersProfile', {
            data: {
                model: this._loadModel(Meteor.user()._id),
            }
        });
    },
    changeProfile: function(t) {
        var name = t.find('#name').value;

        Meteor.users.update(Meteor.user()._id, {$set: {'profile.name': name}}, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
                throw new Meteor.Error(err.message);
            }
            MeteorisFlash.set('success', 'Profile successfully changed');
            t.find('#name').focus();
        });
    },
    changePassword: function(t) {
        var oldPassword = t.find('#oldPassword').value;
        var newPassword = t.find('#newPassword').value;
        var confirmNewPassword = t.find('#confirmNewPassword').value;

        if (newPassword != confirmNewPassword) {
            var errMessage = 'New Password and Password Confirmation must be equal';
            MeteorisFlash.set('danger', errMessage);
            throw new Meteor.Error(errMessage);
        } else if (newPassword.length < 6) {
            var errMessage = 'New Password at least has 6 min length';
            MeteorisFlash.set('danger', errMessage);
            throw new Meteor.Error(errMessage);
        }
        Accounts.changePassword(oldPassword, newPassword, function(err) {
            if (err) {
                MeteorisFlash.set('danger', err.message);
                throw new Meteor.Error(err.message);
            } else {
                MeteorisFlash.set('success', 'Password successfully changed');
                $('#change_password_form')[0].reset();
                t.find('#oldPassword').focus();
            }
        });
    },
    _loadModel: function(_id) {
        return Meteor.users.findOne(_id);
    },
});