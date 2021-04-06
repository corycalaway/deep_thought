const { User, Thought } = require('../models');

const resolvers = {
    Query: {

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
    }
};

module.exports = resolvers;

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

        