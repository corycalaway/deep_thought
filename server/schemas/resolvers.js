const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('thoughts')
                .populate('friends');
          
              return userData;
            }
          
            throw new AuthenticationError('Not logged in');
          },
        // get all users
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        // get a user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createdAt: -1 });
        },
        // place this inside of the `Query` nested object right after `thoughts` 
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        //   thoughts: async () => {
        //     return Thought.find().sort({ createdAt: -1 });
        //   }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
          
            return { token, user };
          },
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
          
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const correctPw = await user.isCorrectPassword(password);
          
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const token = signToken(user);
            return { token, user };
          },
          addThought: async (parent, args, context) => {
            if (context.user) {
              const thought = await Thought.create({ ...args, username: context.user.username });
          
              await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { thoughts: thought._id } },
                { new: true }
              );
          
              return thought;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          },
          addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
              const updatedThought = await Thought.findOneAndUpdate(
                { _id: thoughtId },
                { $push: { reactions: { reactionBody, username: context.user.username } } },
                { new: true, runValidators: true }
              );
          
              return updatedThought;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          },
          addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { friends: friendId } },
                { new: true }
              ).populate('friends');
          
              return updatedUser;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          }
        // addUser: async (parent, args) => {
        //     const user = await User.create(args);
          
        //     return user;
        //   },
        //   login: async (parent, { email, password }) => {
        //     const user = await User.findOne({ email });
          
        //     if (!user) {
        //       throw new AuthenticationError('Incorrect credentials');
        //     }
          
        //     const correctPw = await user.isCorrectPassword(password);
          
        //     if (!correctPw) {
        //       throw new AuthenticationError('Incorrect credentials');
        //     }
          
        //     return user;
        //   },
          
    }
};

module.exports = resolvers;
//creds
// {
//     "email": "test2@test.com",
//     "password": "test12345"
//   }
   // Query Examples
        // query {
        //     # find a username from your previous query's results and paste it in for `<username-goes-here>` (i.e. "Wilton18")
        //     thoughts(username: "Emmy1") {
        //       username
        //       thoughtText
        //     }
        //   }

        // query {
        //     thoughts(username: "Emmy1") {
        //       _id
        //       username
        //       thoughtText
        //       reactions {
        //         _id
        //         createdAt
        //         username
        //         reactionBody
        //       }
        //     }
        //   }

        // query {
        //     # query all thoughts
        //     thoughts {
        //       _id
        //       username
        //       thoughtText
        //       reactions {
        //         _id
        //         createdAt
        //         username
        //         reactionBody
        //       }
        //     }

        //     # query a single thought, use the `_id` value of a thought that returned from a previous query
        //     thought(_id: "<thought-id-here>") {
        //       _id
        //       username
        //       thoughtText
        //       createdAt
        //       reactions {
        //         username
        //         reactionBody
        //       }
        //     }
        //   }

        // query {
        //     # get all users
        //     users {
        //       username
        //       email
        //     }

        //     # get a single user by username (use a username from your database)
        //     user(username: "Armani_Cruickshank76") {
        //       username
        //       email
        //       friendCount
        //       thoughts {
        //         thoughtText
        //       }
        //       friends {
        //         username
        //       }
        //     }

        //     # query all thoughts
        //     thoughts {
        //       _id
        //       username
        //       thoughtText
        //       reactions {
        //         _id
        //         createdAt
        //         username
        //         reactionBody
        //       }
        //     }

        //     # query a single thought (use an _id from a thought in your database)
        //     thought(_id: "606b3f7be4546c70ac935d11") {
        //       _id
        //       username
        //       thoughtText
        //       createdAt
        //       reactions {
        //         username
        //         reactionBody
        //       }
        //     }
        //   }

        // Variable query
        // query getSingleUser($username: String!) {
        //     user(username: $username) {
        //       username
        //       friendCount
        //       thoughts {
        //         thoughtText
        //         createdAt
        //       }
        //       friends {
        //         username
        //       }
        //     }
        //   }



        // mutation examples
        // mutation {
        //     addUser(username:"tester", password:"test12345", email:"test@test.com") {
        //       _id
        //       username
        //       email
        //     }
        //   }

        //   mutation addUser($username: String!, $password: String!, $email: String!) {
        //     addUser(username: $username, password: $password, email: $email) {
        //       _id
        //       username
        //       email
        //     }
        //   }

        // mutation login($email: String!, $password: String!) {
        //     login(email: $email, password: $password) {
        //       _id
        //       username
        //       email
        //     }
        //   }

        // mutation login($email: String!, $password: String!) {
        //     login(email: $email, password: $password) {
        //       token
        //       user {
        //         _id
        //       }
        //     }
        //   }