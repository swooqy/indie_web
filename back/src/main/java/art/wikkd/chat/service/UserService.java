package art.wikkd.chat.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import art.wikkd.chat.entity.User;
import art.wikkd.chat.repository.UserRepository;

@Service
public class UserService {

    UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByUuid(UUID uuid) {
        return userRepository.findByUuid(uuid).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UUID createUser(String username) {
        User user = new User();
        user.setUuid(UUID.randomUUID());
        user.setUsername(username);
        userRepository.save(user);
        return user.getUuid();
    }

    public void updateUserName(String username, UUID uuid) {
        User user = getUserByUuid(uuid);
        user.setUsername(username);
        userRepository.save(user);
    }
}
