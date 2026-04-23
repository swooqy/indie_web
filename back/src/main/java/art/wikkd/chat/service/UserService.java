package art.wikkd.chat.service;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import art.wikkd.chat.entity.User;
import art.wikkd.chat.exception.ChatException;
import art.wikkd.chat.repository.UserRepository;

@Service
public class UserService {

    UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByUuid(UUID uuid) {
        return userRepository.findByUuid(uuid).orElseThrow(() -> new ChatException("UUID not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ChatException("User not found"));
    }

    public UUID createUser(String username) {
        User user = new User();
        user.setUuid(UUID.randomUUID());
        user.setUsername(username);
        user.setColorHex(generateColorHex());
        userRepository.save(user);
        return user.getUuid();
    }

    public void updateUserName(String username, UUID uuid) {
        User user = getUserByUuid(uuid);
        user.setUsername(username);
        userRepository.save(user);
    }

    private String generateColorHex() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int[] c = {0xFF, 0x00, random.nextInt(256)};
        for (int i = 2; i > 0; i--) {
            int j = random.nextInt(i + 1);
            int t = c[i];
            c[i] = c[j];
            c[j] = t;
        }
        return String.format("#%02X%02X%02X", c[0], c[1], c[2]);
    }
}
